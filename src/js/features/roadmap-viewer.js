/**
 * Feature: Roadmap Viewer
 *
 * Renders a vertical glowing timeline of ordered learning blocks for a subject.
 * Manages done / active / locked state and wires the Done button per block.
 *
 * Block types:
 *   - video  → embedded YouTube iframe (with link fallback)
 *   - pdf    → embedded PDF iframe + mandatory open-in-tab fallback link
 *   - text   → sanitized HTML content via DOMPurify (falls back to textContent)
 *
 * Text sanitization: delegates entirely to window.DOMPurify, which is loaded
 * via CDN in subject.html. If DOMPurify is unavailable (offline / CSP), the
 * content renders as plain text rather than crashing.
 *
 * Progress storage: delegates to roadmap-progress.js (localStorage in V0.2).
 */

import { ROADMAP_BLOCKS_COLLECTION } from "../config/subjects-config.js";
import { fetchWithCache } from "../utils/cache-manager.js";
import { loadProgress, saveProgress } from "./roadmap-progress.js";

// ---------------------------------------------------------------------------
// YouTube URL Parsing
// ---------------------------------------------------------------------------

/**
 * Extracts the YouTube video ID from a variety of URL formats:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID&t=30s  (extra params)
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param {string} url
 * @returns {string|null}  11-character video ID, or null if not recognised.
 */
function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// ---------------------------------------------------------------------------
// Firestore Fetch
// ---------------------------------------------------------------------------

/**
 * Fetches active roadmap blocks for a subject, ordered by `order`.
 *
 * Falls back to an unordered query if the composite index is not yet deployed,
 * then sorts client-side. This is a safety net — the index should be deployed
 * before production use (see firestore.indexes.json).
 *
 * @param {string} subjectId
 * @param {object|null} db  Firestore compat instance
 * @returns {Promise<Array>}  Array of block objects with id merged in.
 */
async function fetchRoadmapBlocks(subjectId, db) {
  if (!db || !subjectId) return [];

  return fetchWithCache(db, `mansa_roadmap_${subjectId}`, `roadmap_${subjectId}`, async () => {
    let snapshot;

    try {
      snapshot = await db
        .collection(ROADMAP_BLOCKS_COLLECTION)
        .where("subjectId", "==", subjectId)
        .orderBy("order")
        .get();
    } catch {
      // Composite index not deployed — fall back to unordered fetch.
      try {
        snapshot = await db
          .collection(ROADMAP_BLOCKS_COLLECTION)
          .where("subjectId", "==", subjectId)
          .get();
      } catch {
        return [];
      }
    }

    if (!snapshot || snapshot.empty) return [];

    const blocks = [];
    snapshot.forEach((doc) => {
      const data = doc.data() || {};
      if (data.isActive === false) return; // filter inactive blocks
      blocks.push({ id: doc.id, ...data });
    });

    // Client-side sort (no-op when Firestore already returned ordered results).
    blocks.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

    return blocks;
  });
}

// ---------------------------------------------------------------------------
// State Computation
// ---------------------------------------------------------------------------

/**
 * Annotates each block with its render state:
 *   'done'   → completed (before the active block)
 *   'active' → the first incomplete block (only one at a time)
 *   'locked' → all blocks after the active block
 *
 * If every block is done, all states remain 'done' (no active block shown).
 *
 * @param {Array} blocks
 * @param {Map<string, object>} progressMap  blockId → { completedAt }
 * @returns {Array}  New array with `state` field added to each block.
 */
function computeBlockStates(blocks, progressMap) {
  let activeAssigned = false;

  return blocks.map((block) => {
    if (progressMap.has(block.id)) {
      return { ...block, state: "done" };
    }

    if (!activeAssigned) {
      activeAssigned = true;
      return { ...block, state: "active" };
    }

    return { ...block, state: "locked" };
  });
}

// ---------------------------------------------------------------------------
// DOM Rendering — Connector
// ---------------------------------------------------------------------------

/**
 * Creates the vertical line connector between two timeline steps.
 * The connector glows when progress has already passed through it.
 *
 * @param {boolean} isLit  True when the block above this connector is done.
 * @returns {HTMLElement}
 */
function renderRoadmapConnector(isLit) {
  const connector = document.createElement("div");
  connector.className = "roadmap-connector" + (isLit ? " is-lit" : "");
  return connector;
}

// ---------------------------------------------------------------------------
// DOM Rendering — Block Content by Type
// ---------------------------------------------------------------------------

/**
 * Renders a YouTube embed with a link fallback.
 * @param {object} block
 * @returns {HTMLElement}
 */
function renderVideoContent(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "roadmap-embed roadmap-embed--video";

  const videoId = extractYouTubeId(block.youtubeUrl || "");

  if (videoId) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.setAttribute("frameborder", "0");
    iframe.title = block.title || "فيديو تعليمي";
    wrapper.appendChild(iframe);
  } else {
    const error = document.createElement("p");
    error.className = "roadmap-embed-error";
    error.textContent = "تعذر تحميل الفيديو — رابط يوتيوب غير صالح.";
    wrapper.appendChild(error);
  }

  // Always show a direct link alongside the embed as a fallback.
  if (block.youtubeUrl) {
    const link = document.createElement("a");
    link.href = block.youtubeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "roadmap-fallback-link";
    link.textContent = "افتح الفيديو في يوتيوب ↗";
    wrapper.appendChild(link);
  }

  return wrapper;
}

/**
 * Renders a PDF embed with a mandatory open-in-tab fallback link.
 * Mobile browsers often cannot render PDFs inline, so the fallback is critical.
 * @param {object} block
 * @returns {HTMLElement}
 */
function renderPdfContent(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "roadmap-embed roadmap-embed--pdf";

  if (block.pdfUrl) {
    const iframe = document.createElement("iframe");
    iframe.src = block.pdfUrl;
    iframe.type = "application/pdf";
    iframe.setAttribute("frameborder", "0");
    iframe.title = block.title || "ملف PDF";
    wrapper.appendChild(iframe);
  } else {
    const error = document.createElement("p");
    error.className = "roadmap-embed-error";
    error.textContent = "لا يوجد رابط PDF متاح لهذه المادة.";
    wrapper.appendChild(error);
  }

  // Mandatory fallback — always rendered for PDF blocks.
  if (block.pdfUrl) {
    const fallback = document.createElement("a");
    fallback.href = block.pdfUrl;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.className = "roadmap-pdf-fallback";
    fallback.textContent = "فتح PDF في تبويب جديد ↗";
    wrapper.appendChild(fallback);
  }

  return wrapper;
}

/**
 * Renders sanitized HTML content for a text block.
 * Uses DOMPurify when available; degrades to textContent if not.
 * @param {object} block
 * @returns {HTMLElement}
 */
function renderTextContent(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "roadmap-text-content";

  const raw = block.content || "";

  if (window.DOMPurify) {
    // DOMPurify loaded via CDN in subject.html — safe innerHTML assignment.
    wrapper.innerHTML = window.DOMPurify.sanitize(raw);
  } else {
    // Graceful degradation: no sanitizer available — render as plain text.
    wrapper.textContent = raw;
  }

  return wrapper;
}

/**
 * Renders a static image with an optional caption.
 * imageUrl is set as img.src — no innerHTML used, no sanitization needed.
 * @param {object} block
 * @returns {HTMLElement}
 */
function renderImageContent(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "roadmap-embed roadmap-embed--image";

  if (block.imageUrl) {
    const img = document.createElement("img");
    img.src = block.imageUrl;
    img.alt = block.caption || block.title || "صورة";
    img.loading = "lazy";
    img.onerror = () => {
      img.style.display = "none";
      const err = document.createElement("p");
      err.className = "roadmap-embed-error";
      err.textContent = "تعذر تحميل الصورة — تحقق من الرابط.";
      wrapper.appendChild(err);
    };
    wrapper.appendChild(img);

    if (block.caption) {
      const cap = document.createElement("p");
      cap.className = "roadmap-image-caption";
      cap.textContent = block.caption;
      wrapper.appendChild(cap);
    }
  } else {
    const error = document.createElement("p");
    error.className = "roadmap-embed-error";
    error.textContent = "لا يوجد رابط صورة متاح.";
    wrapper.appendChild(error);
  }

  return wrapper;
}

/**
 * Dispatches to the correct content renderer based on block.type.
 * Unknown types fall back to a text renderer.
 * @param {object} block
 * @returns {HTMLElement}
 */
function renderBlockContent(block) {
  if (block.type === "video") return renderVideoContent(block);
  if (block.type === "pdf") return renderPdfContent(block);
  if (block.type === "image") return renderImageContent(block);
  return renderTextContent(block);
}

// ---------------------------------------------------------------------------
// DOM Rendering — Individual Block
// ---------------------------------------------------------------------------

/**
 * Creates the full DOM element for a single roadmap step, including:
 *   - Step node (number or checkmark)
 *   - Card with title, content body, and Done button
 *
 * Locked blocks: card content is fully visible (motivating) but the Done
 * button is disabled with a tooltip. Only the button is non-interactive.
 *
 * @param {object} block        Block data with `state` field attached.
 * @param {number} index        0-based position in the rendered list.
 * @param {string} subjectId
 * @param {Map}    progressMap  Current progress (passed to handleDoneClick).
 * @param {HTMLElement} containerEl  The #roadmapTimeline container.
 * @returns {HTMLElement}
 */
function renderRoadmapBlock(block, index, subjectId, progressMap, containerEl) {
  const isDone = block.state === "done";
  const isActive = block.state === "active";
  const isLocked = block.state === "locked";

  // --- Step wrapper ---
  const step = document.createElement("div");
  step.className = [
    "roadmap-step",
    isDone ? "is-done" : "",
    isActive ? "is-active" : "",
    isLocked ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  step.dataset.blockId = block.id;

  // --- Node (step number or checkmark) ---
  const node = document.createElement("div");
  node.className = [
    "roadmap-node",
    isDone ? "is-done" : "",
    isActive ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  node.setAttribute("aria-hidden", "true");
  node.textContent = isDone ? "✓" : String(index + 1);
  step.appendChild(node);

  // --- Card ---
  const card = document.createElement("div");
  card.className = "roadmap-card";

  const titleEl = document.createElement("h3");
  titleEl.className = "roadmap-card-title";
  titleEl.textContent = block.title || "بدون عنوان";
  card.appendChild(titleEl);

  const body = document.createElement("div");
  body.className = "roadmap-card-body";
  body.appendChild(renderBlockContent(block));
  card.appendChild(body);

  // --- Actions row ---
  const actions = document.createElement("div");
  actions.className = "roadmap-card-actions";

  const doneBtn = document.createElement("button");
  doneBtn.className = "roadmap-done-btn";
  doneBtn.type = "button";

  if (isDone) {
    doneBtn.textContent = "✓ تم";
    doneBtn.disabled = true;
    doneBtn.classList.add("is-done");
  } else if (isLocked) {
    doneBtn.textContent = "🔒 مقفول";
    doneBtn.disabled = true;
    doneBtn.title = "أكمل الخطوة السابقة أولاً";
    doneBtn.style.cursor = "not-allowed";
    doneBtn.classList.add("is-locked");
  } else {
    // Active block — wire the click handler.
    doneBtn.textContent = "تم ✓";
    doneBtn.classList.add("is-active");
    doneBtn.addEventListener("click", () => {
      handleDoneClick(subjectId, block.id, containerEl, progressMap);
    });
  }

  actions.appendChild(doneBtn);
  card.appendChild(actions);
  step.appendChild(card);

  return step;
}

// ---------------------------------------------------------------------------
// DOM Rendering — Full Timeline
// ---------------------------------------------------------------------------

/**
 * Clears the container and renders all blocks interleaved with connectors.
 *
 * @param {Array}       blocks       Raw blocks (without state — computed here).
 * @param {Map}         progressMap
 * @param {HTMLElement} containerEl  #roadmapTimeline
 * @param {string}      subjectId
 */
function renderRoadmapTimeline(blocks, progressMap, containerEl, subjectId) {
  containerEl.innerHTML = "";

  const annotated = computeBlockStates(blocks, progressMap);

  annotated.forEach((block, index) => {
    const stepEl = renderRoadmapBlock(
      block,
      index,
      subjectId,
      progressMap,
      containerEl,
    );
    containerEl.appendChild(stepEl);

    // Add a connector after every block except the last.
    if (index < annotated.length - 1) {
      containerEl.appendChild(renderRoadmapConnector(block.state === "done"));
    }
  });
}

// ---------------------------------------------------------------------------
// Done Button Handler
// ---------------------------------------------------------------------------

/**
 * Called when the user taps "Done ✓" on the active block.
 *
 * 1. Shows a brief loading state on the button.
 * 2. Saves progress to localStorage via roadmap-progress.js.
 * 3. Updates the in-memory progressMap.
 * 4. Re-renders the timeline to reflect the new state.
 * 5. Smooth-scrolls to the newly active block.
 *
 * The raw blocks array is stored as a JSON string on containerEl.dataset.rawBlocks
 * by initRoadmapViewer so we can re-render without a Firestore round-trip.
 *
 * @param {string}      subjectId
 * @param {string}      blockId
 * @param {HTMLElement} containerEl  #roadmapTimeline
 * @param {Map}         progressMap  Mutated in place for the re-render.
 */
function handleDoneClick(subjectId, blockId, containerEl, progressMap) {
  // Briefly show loading state while we save.
  const stepEl = containerEl.querySelector(`[data-block-id="${blockId}"]`);
  const btn = stepEl ? stepEl.querySelector(".roadmap-done-btn") : null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = "...";
    btn.classList.add("loading");
  }

  // Persist and update in-memory state.
  saveProgress(subjectId, blockId);
  progressMap.set(blockId, { completedAt: new Date().toISOString() });

  // Retrieve raw blocks stored during initial render.
  const rawBlocksJson = containerEl.dataset.rawBlocks;
  if (!rawBlocksJson) return;

  let rawBlocks;
  try {
    rawBlocks = JSON.parse(rawBlocksJson);
  } catch {
    return;
  }

  // Re-render the full timeline with updated progress.
  renderRoadmapTimeline(rawBlocks, progressMap, containerEl, subjectId);

  // Scroll the new active block into view.
  const activeStep = containerEl.querySelector(".roadmap-step.is-active");
  if (activeStep) {
    activeStep.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ---------------------------------------------------------------------------
// Public Entry Point
// ---------------------------------------------------------------------------

/**
 * Initialises the roadmap viewer for a subject page.
 *
 * Fetches blocks → loads progress → renders timeline → reveals the section.
 * If there are no active blocks for the subject, #roadmapSection remains hidden.
 *
 * @param {string}      subjectId
 * @param {object|null} db  Firestore compat instance (may be null if Firebase failed).
 */
async function initRoadmapViewer(subjectId, db) {
  const section = document.getElementById("roadmapSection");
  const container = document.getElementById("roadmapTimeline");

  if (!section || !container) return false;

  const blocks = await fetchRoadmapBlocks(subjectId, db);

  if (!blocks.length) {
    return false;
  }

  // Cache raw blocks on the container for Done-button re-renders.
  container.dataset.rawBlocks = JSON.stringify(blocks);

  const progressMap = loadProgress(subjectId);
  renderRoadmapTimeline(blocks, progressMap, container, subjectId);

  // Scroll the active block into view on initial load.
  const activeStep = container.querySelector(".roadmap-step.is-active");
  if (activeStep) {
    activeStep.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return true;
}

export { initRoadmapViewer };
