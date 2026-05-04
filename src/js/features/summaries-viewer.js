/**
 * Feature: Summaries Viewer (Student facing)
 * Renders summary cards (PDF, text, image) for a specific subject.
 */

import { SUMMARIES_COLLECTION } from "../config/subjects-config.js";
import { fetchWithCache } from "../utils/cache-manager.js";

// ---------------------------------------------------------------------------
// Firestore Fetch
// ---------------------------------------------------------------------------

async function fetchSummaries(subjectId, db) {
  if (!db || !subjectId) return [];

  return fetchWithCache(db, `mansa_summaries_${subjectId}`, `summaries_${subjectId}`, async () => {
    let snapshot;
    try {
      snapshot = await db
        .collection(SUMMARIES_COLLECTION)
        .where("subjectId", "==", subjectId)
        .orderBy("order")
        .get();
    } catch {
      // Fallback if index isn't ready
      try {
        snapshot = await db
          .collection(SUMMARIES_COLLECTION)
          .where("subjectId", "==", subjectId)
          .get();
      } catch {
        return [];
      }
    }

    if (!snapshot || snapshot.empty) return [];

    const summaries = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.isActive !== false) {
        summaries.push({ id: doc.id, ...data });
      }
    });

    summaries.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    return summaries;
  });
}

// ---------------------------------------------------------------------------
// Content Renderers (Reused from roadmap)
// ---------------------------------------------------------------------------

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
    error.textContent = "لا يوجد رابط PDF متاح.";
    wrapper.appendChild(error);
  }

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

function renderTextContent(block) {
  const wrapper = document.createElement("div");
  wrapper.className = "roadmap-text-content";
  const raw = block.content || "";

  if (window.DOMPurify) {
    wrapper.innerHTML = window.DOMPurify.sanitize(raw);
  } else {
    wrapper.textContent = raw;
  }

  return wrapper;
}

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

function renderSummaryCard(summary) {
  const card = document.createElement("div");
  card.className = "summary-card";

  const title = document.createElement("h3");
  title.className = "summary-card-title";
  title.textContent = summary.title || "ملخص بدون عنوان";
  card.appendChild(title);

  let content;
  if (summary.type === "pdf") {
    content = renderPdfContent(summary);
  } else if (summary.type === "image") {
    content = renderImageContent(summary);
  } else {
    // Fallback to text
    content = renderTextContent(summary);
  }

  card.appendChild(content);
  return card;
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

async function initSummariesViewer(subjectId, db) {
  const section = document.getElementById("summariesSection");
  const listContainer = document.getElementById("summariesList");

  if (!section || !listContainer) return false;

  const summaries = await fetchSummaries(subjectId, db);

  if (!summaries || summaries.length === 0) {
    return false;
  }

  listContainer.innerHTML = "";
  summaries.forEach((s) => {
    listContainer.appendChild(renderSummaryCard(s));
  });

  return true;
}

export { initSummariesViewer };
