# Roadmap Feature — Implementation Plan

> **Project:** ليالي الامتحان · **Version Target:** V0.2-alpha  
> **Prepared:** 2026-05-04 · **Status:** Awaiting Approval

---

## 1. Feature Overview

The **Roadmap** is a per-subject, ordered learning path composed of sequential content blocks. Each block is one of three types: **Video** (embedded YouTube), **PDF** (embedded viewer), or **Text** (rich custom content). A glowing visual timeline connects all blocks. Each block has a **"Done ✓"** button that saves the user's completion state and visually advances the timeline to highlight the next block.

Admins can create, edit, reorder, and delete roadmap blocks for any subject directly from the admin dashboard, using type-aware dynamic form inputs.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  subject.html  (existing page — extended)                       │
│                                                                  │
│  subject-page.js ──imports──► roadmap-viewer.js (NEW)           │
│                                    │                             │
│                                    ▼                             │
│                           roadmap-progress.js (NEW)              │
│                                    │                             │
│                    ┌───────────────┴───────────────┐            │
│                    ▼                               ▼             │
│          Firestore: roadmap_blocks        Firestore: user_progress│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  admin-dashboard.html  (existing page — extended)               │
│                                                                  │
│  admin-dashboard-page.js ──imports──► admin-roadmap.js (NEW)    │
│                                    │                             │
│                                    ▼                             │
│                       Firestore: roadmap_blocks (write)          │
└─────────────────────────────────────────────────────────────────┘
```

### Layered Responsibilities

| Layer | File | Role |
|---|---|---|
| Config | `src/js/config/firebase.js` | Existing — no changes |
| Config | `src/js/config/subjects-config.js` | Add `ROADMAP_COLLECTION` constant |
| Feature | `src/js/features/roadmap-viewer.js` | **NEW** — fetch blocks, render timeline, handle Done |
| Feature | `src/js/features/roadmap-progress.js` | **NEW** — read/write user progress to Firestore |
| Feature | `src/js/features/admin-roadmap.js` | **NEW** — admin CRUD for roadmap blocks |
| Page | `src/js/pages/subject-page.js` | **MODIFY** — call roadmap viewer init |
| Page | `src/js/pages/admin-dashboard-page.js` | **MODIFY** — plug in admin roadmap tab |
| CSS | `src/css/pages/subject.css` | **MODIFY** — add roadmap timeline styles |
| CSS | `src/css/pages/admin-dashboard.css` | **MODIFY** — add roadmap admin form styles |
| HTML | `subject.html` | **MODIFY** — add `#roadmapSection` mount point |
| HTML | `admin-dashboard.html` | **MODIFY** — add tab bar div |
| DB | `firestore.rules` | **MODIFY** — add rules for 2 new collections |
| DB | `firestore.indexes.json` | **NEW** — composite index for roadmap_blocks |
| Docs | `docs/FIREBASE_SUBJECTS_SETUP.md` | **MODIFY** — document new collections |

---

## 3. Firestore Database Schema

### 3.1 Collection: `roadmap_blocks`

**Path:** `/roadmap_blocks/{blockId}`

Each document is a single content block belonging to one subject's roadmap.

```
roadmap_blocks/{blockId}
├── subjectId        (string, required)  — FK → subjects/{id}
├── type             (string, required)  — "video" | "pdf" | "text"
├── title            (string, required)  — Display heading for the block
├── order            (number, required)  — Sort index, 1-based, unique per subject
├── isActive         (boolean)          — false = hidden from students
│
│   ── type: "video" only ──
├── youtubeUrl       (string)           — Full YouTube URL or short youtu.be link
│
│   ── type: "pdf" only ──
├── pdfUrl           (string)           — Direct link to publicly accessible PDF
│
│   ── type: "text" only ──
└── content          (string)           — Markdown/HTML string (sanitized on render)
```

**Document ID strategy:** Auto-generated Firestore ID (`db.collection('roadmap_blocks').doc()`).  
**Querying:** Always query as `where('subjectId', '==', id).orderBy('order')`.

> [!IMPORTANT]
> A composite index on `(subjectId ASC, order ASC)` is required. This must be created via `firestore.indexes.json` (Task T-03) before the feature can go live.

---

### 3.2 Collection: `user_progress`

**Path:** `/user_progress/{userId}/roadmap/{blockId}`

This is a **subcollection** per user. Progress is stored as individual documents keyed by `blockId`.

```
user_progress/{userId}/roadmap/{blockId}
├── subjectId        (string)     — Denormalized for easier queries
├── completedAt      (timestamp)  — Firestore server timestamp
└── doneCount        (number)     — Incremented on each tap (analytics)
```

> [!NOTE]
> **Anonymous / Unauthenticated users:** Progress is stored in `localStorage` only. No Firestore write is attempted unless `firebase.auth().currentUser` is non-null. This ensures the feature is fully functional for guests without a login gate.

**localStorage fallback key:** `mansa_roadmap_progress_{subjectId}`  
**Structure:** `{ [blockId]: { completedAt: ISO string } }`

---

### 3.3 Firestore Rules — Additions

```
// NEW — add before the existing catch-all deny rule

match /roadmap_blocks/{blockId} {
  allow read: if true;           // public — students read blocks
  allow write: if isAdmin();     // admin only
}

match /user_progress/{userId}/roadmap/{blockId} {
  allow read, write: if request.auth != null
                     && request.auth.uid == userId;
}
```

> [!WARNING]
> The existing catch-all `match /{document=**} { allow read, write: if false; }` will **block** the `user_progress` subcollection unless the explicit rule is placed **before** it. Rule order matters.

---

## 4. User UI — `subject.html` Updates

### 4.1 HTML Addition

Add a new `<section>` after the existing `.subject-grid` section, before `</main>`:

```html
<section class="roadmap-section" id="roadmapSection" aria-labelledby="roadmapHeading">
    <div class="roadmap-header">
        <h2 id="roadmapHeading">🗺️ خريطة المذاكرة</h2>
        <p class="roadmap-subtitle">اتبع الخطوات بالترتيب لأفضل نتيجة</p>
    </div>
    <div class="roadmap-timeline" id="roadmapTimeline">
        <!-- Populated by roadmap-viewer.js -->
    </div>
</section>
```

### 4.2 CSS Class Map — `src/css/pages/subject.css`

```
.roadmap-section            → wrapper; hidden (display:none) until blocks load
.roadmap-header             → heading area
.roadmap-timeline           → flex-column container for all blocks
.roadmap-step               → single block wrapper
  .roadmap-step.is-done     → completed state (muted, checkmark)
  .roadmap-step.is-active   → current step (glowing border, full opacity)
  .roadmap-step.is-locked   → future steps (dimmed, Done btn disabled)
.roadmap-connector          → vertical line between steps
  .roadmap-connector.is-lit → accent-colored glow (progress has passed)
.roadmap-node               → circular step bullet
  .roadmap-node.is-done     → green checkmark
  .roadmap-node.is-active   → pulsing glow ring (@keyframes pulse-ring)
.roadmap-card               → content card
.roadmap-card-title         → block heading
.roadmap-card-body          → iframe / text content area
.roadmap-card-actions       → footer row with Done button
.roadmap-done-btn           → "تم ✓" button
  .roadmap-done-btn.loading → spinner state while saving
.roadmap-embed--video       → 56.25% padding-top aspect ratio container
.roadmap-embed--pdf         → fixed 500px height container
.roadmap-text-content       → prose styles
```

**Key visual rules:**
- `--subject-accent` (already set by `subject-page.js`) drives all glow colors
- Connector glow: `box-shadow: 0 0 8px var(--subject-accent), 0 0 20px var(--subject-accent)44`
- Active node pulse: `@keyframes pulse-ring` expanding + fading box-shadow
- Locked blocks: `opacity: 0.45`; `pointer-events: none` on Done button only (content viewable)
- Done blocks: `opacity: 0.7`, green `#38ef7d` node, checkmark replaces number

### 4.3 Block Type Rendering

**Video:** Convert `youtubeUrl` to embed URL via `extractYouTubeId(url)` regex, then:
```html
<div class="roadmap-embed roadmap-embed--video">
  <iframe src="https://www.youtube.com/embed/{videoId}" allowfullscreen loading="lazy"></iframe>
</div>
```

**PDF:** 
```html
<div class="roadmap-embed roadmap-embed--pdf">
  <iframe src="{pdfUrl}" type="application/pdf"></iframe>
  <a href="{pdfUrl}" target="_blank" class="roadmap-pdf-fallback">فتح PDF في تبويب جديد ↗</a>
</div>
```

**Text:**
```html
<div class="roadmap-text-content">
  <!-- sanitizeHtml(content) injected as innerHTML -->
</div>
```
Sanitization: strip `<script>`, `<iframe>`, all `on*` event attributes. Allow: `b, i, ul, ol, li, a, br, p, h3, h4, strong, em`.

### 4.4 Progress Logic (Client-Side)

**On page load** (`initRoadmapViewer(subjectId, db)`):
1. Fetch all `roadmap_blocks` where `subjectId == id`, `isActive == true`, ordered by `order`
2. Load progress from localStorage (→ `Map<blockId, data>`)
3. `computeBlockStates(blocks, progressMap)` → assigns `state: 'done' | 'active' | 'locked'`
   - `active` = first block where state is not done
   - All before `active` = done; all after = locked
4. Render all blocks; if 0 blocks → `#roadmapSection` stays hidden
5. Smooth-scroll active block into view

**On "Done ✓" click** (`handleDoneClick(subjectId, blockId, containerEl)`):
1. Disable button, add `.loading` class (spinner)
2. `saveProgress(subjectId, blockId)` → localStorage write
3. Re-render timeline with updated progress state
4. Smooth-scroll to newly active block

---

## 5. Admin UI — `admin-dashboard.html` Updates

### 5.1 Tab Bar

Add a `<div class="admin-tab-bar" id="adminTabBar"></div>` **before** `<div id="adminTabContent">` in the HTML. The tab bar is rendered dynamically by `renderTabBar(activeTab)` in JS.

| Tab | Key | Content |
|---|---|---|
| 📚 المواد | `subjects` | Existing subjects CRUD |
| 🗺️ خرائط المذاكرة | `roadmap` | New roadmap block manager |

### 5.2 Roadmap Admin Panel Layout

```
[ Subject Selector Dropdown ▼ ]
         ↓
[ ➕ Add Block Form ]
  ┌─ Type ──┐  ┌─ Title ────────────────┐
  │ ▼ Video │  │                        │
  └─────────┘  └────────────────────────┘
  Dynamic fields (show/hide by type):
    Video → YouTube URL input
    PDF   → PDF URL input + "Open" preview link
    Text  → Textarea (multi-line)
  [ Order: # ]  [ Active ☑ ]  [ ➕ Add Block ]
         ↓
[ Block List (ordered) ]
  ⬆️ ⬇️  🎬 Block Title    [ ✏️ Edit ] [ 🗑️ Delete ]
  ⬆️ ⬇️  📄 Block Title    [ ✏️ Edit ] [ 🗑️ Delete ]
  ⬆️ ⬇️  📝 Block Title    [ ✏️ Edit ] [ 🗑️ Delete ]
```

### 5.3 Dynamic Form Fields

On `<select id="adminBlockType">` change:
```
"video" → show #adminVideoFields   | hide #adminPdfFields, #adminTextFields
"pdf"   → show #adminPdfFields     | hide #adminVideoFields, #adminTextFields
"text"  → show #adminTextFields    | hide #adminVideoFields, #adminPdfFields
```

### 5.4 Reorder Logic

Move Up/Down: swap the `order` field values of the target doc and its neighbor via two `.update()` calls, then re-fetch and re-render the block list.

### 5.5 Inline Edit

On ✏️: replace block row with pre-filled edit form (same dynamic field switching). Save → `.update()`. Cancel → re-render original row.

---

## 6. New Files Summary

| File | Purpose |
|---|---|
| `src/js/features/roadmap-viewer.js` | Fetch blocks, render DOM timeline, manage block states, handle Done button |
| `src/js/features/roadmap-progress.js` | Read/write progress to localStorage (+ Firestore when user is signed in) |
| `src/js/features/admin-roadmap.js` | Admin CRUD: load/add/edit/delete/reorder blocks, dynamic form, render list |
| `firestore.indexes.json` | Composite index definition for `(subjectId, order)` on `roadmap_blocks` |

---

## 7. Modified Files Summary

| File | Change |
|---|---|
| `subject.html` | Add `#roadmapSection` HTML mount point |
| `src/js/pages/subject-page.js` | Import & call `initRoadmapViewer(subjectId, db)` |
| `src/css/pages/subject.css` | All roadmap timeline + block styles |
| `admin-dashboard.html` | Add `#adminTabBar` div before `#adminTabContent` |
| `src/js/pages/admin-dashboard-page.js` | Tab bar rendering, `switchAdminTab()`, import `admin-roadmap.js` |
| `src/css/pages/admin-dashboard.css` | Tab bar + roadmap admin form styles |
| `src/js/config/subjects-config.js` | Add `ROADMAP_BLOCKS_COLLECTION` and `USER_PROGRESS_COLLECTION` constants |
| `firestore.rules` | Add `roadmap_blocks` and `user_progress` rules before catch-all |
| `firebase.json` | Add `"indexes": "firestore.indexes.json"` |
| `docs/FIREBASE_SUBJECTS_SETUP.md` | Document new collections and composite index |

---

## 8. Open Questions

> [!IMPORTANT]
> **Q1 — Anonymous Progress:** Currently no student login exists. Should progress be localStorage-only for V0.2, or add `signInAnonymously()` to enable Firestore writes without a full auth UI?
>
> *Recommendation: localStorage only for V0.2. Add Firestore sync in V0.3 when user accounts are introduced.*

> [!IMPORTANT]
> **Q2 — Text Block Sanitization:** Admin writes HTML content that renders via `innerHTML`. Should we add **DOMPurify** (one CDN tag) or implement a manual allowlist?
>
> *Recommendation: DOMPurify CDN for correctness and security. Zero maintenance burden.*

> [!IMPORTANT]
> **Q3 — Block Locking UX:** Should locked blocks be fully hidden or visible-but-dimmed?
>
> *Recommendation: Visible-but-dimmed. Students can see what's coming (motivating). Only the Done button is non-interactive on locked blocks.*

> [!NOTE]
> **Q4 — `firestore.indexes.json`:** This file is currently absent from the repo. This plan includes creating it (T-03). The Firestore emulator and CI pipeline (`npm run verify:ci`) should be tested with the index file present.

---

## 9. Sequential Task List (Optimized for Claude 3.7 Sonnet)

Tasks are strictly ordered so each step depends only on previously completed work.

---

### PHASE 1 — Foundation & Config *(no UI, no breaking changes)*

- `[ ]` **T-01** — Add `ROADMAP_BLOCKS_COLLECTION = 'roadmap_blocks'` and `USER_PROGRESS_COLLECTION = 'user_progress'` to `src/js/config/subjects-config.js`

- `[ ]` **T-02** — Update `firestore.rules`: add `roadmap_blocks` (public read / admin write) and `user_progress/{userId}/roadmap/{blockId}` (owner read/write) rules; place both **before** the existing catch-all deny rule

- `[ ]` **T-03** — Create `firestore.indexes.json` at project root with the composite index definition for `roadmap_blocks`: fields `subjectId ASC` + `order ASC`

- `[ ]` **T-04** — Update `firebase.json` to include `"indexes": "firestore.indexes.json"` alongside existing `"rules"` key

- `[ ]` **T-05** — Update `docs/FIREBASE_SUBJECTS_SETUP.md` to document the `roadmap_blocks` schema, `user_progress` subcollection schema, and the required composite index

---

### PHASE 2 — Core Feature JS *(logic only, no rendering yet)*

- `[ ]` **T-06** — Create `src/js/features/roadmap-progress.js`:
  - `loadProgress(subjectId)` → returns `Map<blockId, {completedAt}>` from localStorage
  - `saveProgress(subjectId, blockId)` → writes to localStorage with `{ completedAt: new Date().toISOString() }`
  - Both functions wrapped in try/catch to handle storage quota errors
  - Export both

- `[ ]` **T-07** — Create `src/js/features/roadmap-viewer.js`:
  - Import `{ loadProgress, saveProgress }` from `./roadmap-progress.js`
  - `extractYouTubeId(url)` → pure function, regex for standard + short URLs, returns `string | null`
  - `sanitizeHtml(raw)` → minimal sanitizer: strip `<script>`, `<iframe>`, all `on*` attributes; allow safe tags
  - `fetchRoadmapBlocks(subjectId, db)` → where + orderBy query; returns `[]` on empty/error; falls back to unordered `.get()` if index error caught
  - `computeBlockStates(blocks, progressMap)` → returns array with added `state: 'done'|'active'|'locked'` per block
  - `renderRoadmapBlock(block, index, subjectId)` → returns DOM **Element** (no innerHTML strings at this level); wires Done button via `addEventListener`
  - `renderRoadmapConnector(isLit)` → returns DOM Element for the vertical line between blocks
  - `renderRoadmapTimeline(blocks, progressMap, containerEl)` → clears container, calls `computeBlockStates`, loops and appends elements + connectors
  - `handleDoneClick(subjectId, blockId, containerEl, progressMap)` → saves progress, re-renders timeline, smooth-scrolls to new active block
  - `initRoadmapViewer(subjectId, db)` → orchestrates fetch → load progress → render; hides `#roadmapSection` if 0 blocks, shows it when blocks exist
  - Export `initRoadmapViewer`

---

### PHASE 3 — Subject Page Integration

- `[ ]` **T-08** — Modify `subject.html`: add `<section class="roadmap-section" id="roadmapSection" ...>` with `#roadmapTimeline` inner div, positioned after `.subject-grid`, before closing `</main>`

- `[ ]` **T-09** — Modify `src/js/pages/subject-page.js`:
  - Add import: `import { initRoadmapViewer } from '../features/roadmap-viewer.js';`
  - Add import: `import { db } from '../config/firebase.js';`
  - At end of `initSubjectPageEntry()` (after all hero rendering), call `initRoadmapViewer(subjectId, db)`

- `[ ]` **T-10** — Add roadmap styles to `src/css/pages/subject.css`:
  - Section layout (hidden by default, flex-column when shown)
  - Timeline container and step wrapper styles
  - Connector line with glow variant (`.is-lit`)
  - Node circle with pulse animation (`@keyframes pulse-ring`) for `.is-active`
  - State modifier classes: `.is-done`, `.is-active`, `.is-locked`
  - Card wrapper, title, body, actions row
  - Video embed aspect-ratio container (56.25% padding-top)
  - PDF embed fixed-height container (500px) + fallback link style
  - Text content prose styles
  - Done button base + loading spinner state
  - Dark mode variants (using existing `.dark *` pattern from `index.css`)
  - Mobile responsive breakpoints (stack layout adjustments)

---

### PHASE 4 — Admin UI

- `[ ]` **T-11** — Create `src/js/features/admin-roadmap.js`:
  - Import `{ db }` from `../config/firebase.js` (or accept `db` as parameter — prefer parameter for testability)
  - Import `{ ROADMAP_BLOCKS_COLLECTION }` from `../config/subjects-config.js`
  - `loadBlocksForSubject(subjectId, db)` → query with where + orderBy; fallback to unordered get on index error
  - `handleAddBlock(formData, db)` → validate: `id`, `type`, `title` required; `youtubeUrl` required if video; `pdfUrl` required if pdf; `content` required if text; then `db.collection(...).add({...})`
  - `handleEditBlock(blockId, formData, db)` → `.update({...})` on existing doc
  - `handleDeleteBlock(blockId, subjectId, db)` → confirm dialog, then `.delete()`, then re-fetch + re-render
  - `handleMoveBlock(blockId, direction, allBlocks, db)` → find target + neighbor, swap `order` via two `.update()` calls, re-fetch + re-render
  - `handleSubjectChange(subjectId, db, containerEl)` → re-fetch blocks, re-render panel
  - `renderAdminRoadmapPanel(subjects, selectedSubjectId, blocks)` → returns full HTML string for add form + block list
  - `renderAdminBlockRow(block)` → returns HTML string for a single block list row
  - `renderAdminEditForm(block)` → returns HTML string for inline edit form pre-filled with block data
  - `initAdminRoadmap(subjects, db, containerEl)` → load blocks for first subject, render panel; expose handlers to `window.*`
  - Exposed to window: `handleAddBlock`, `handleEditBlock`, `handleDeleteBlock`, `handleMoveBlock`, `handleSubjectChange`, `handleAdminEditBlock`, `handleAdminCancelEdit`

- `[ ]` **T-12** — Modify `admin-dashboard.html`: add `<div class="admin-tab-bar" id="adminTabBar"></div>` directly before `<div id="adminTabContent" ...>`

- `[ ]` **T-13** — Modify `src/js/pages/admin-dashboard-page.js`:
  - Add import: `import { initAdminRoadmap } from '../features/admin-roadmap.js';`
  - Add `renderTabBar(activeTab)` → renders tab buttons into `#adminTabBar`
  - Add `switchAdminTab(tabKey)` → updates active tab button state, re-renders `#adminTabContent` for the selected tab; expose to `window`
  - Modify `showDashboard(user)` → call `renderTabBar('subjects')` after rendering subjects tab; pass subjects list to roadmap init
  - Expose `window.switchAdminTab`

- `[ ]` **T-14** — Add admin roadmap styles to `src/css/pages/admin-dashboard.css`:
  - `.admin-tab-bar` flex row + bottom border
  - `.admin-tab-btn` base style, hover, and `.active` state (accent underline)
  - `.roadmap-admin-panel` wrapper
  - `.roadmap-subject-select` styled dropdown matching existing form inputs
  - `.roadmap-block-type-fields` container for dynamic field groups
  - `.admin-roadmap-block-row` list item with icon badge, move buttons, action buttons
  - `.admin-roadmap-edit-form` inline edit mode styling
  - Consistent dark theme variables (reuse existing CSS custom properties)

---

### PHASE 5 — Verification & Docs

- `[ ]` **T-15** — Manual smoke test:
  - Seed 3 test blocks (1 video, 1 PDF, 1 text) via admin dashboard for a test subject
  - Open `subject.html?subject=<testId>` — confirm all block types render correctly
  - Click Done on block 1 — confirm state transitions (block 1 → done, block 2 → active)
  - Reload page — confirm progress persists from localStorage
  - Toggle block 2 `isActive` to false via admin — confirm it disappears from student view
  - Test on mobile viewport — confirm embeds do not overflow, Done button is accessible

- `[ ]` **T-16** — Update `docs/PREDEPLOY_CHECKLIST.md` to add a Roadmap section:
  - Verify `firestore.indexes.json` is committed and the composite index is deployed
  - Verify Firestore rules cover both `roadmap_blocks` and `user_progress`
  - Verify at least one subject has roadmap blocks seeded before public launch

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Composite index missing → query fails | Medium | High | T-03 creates `firestore.indexes.json`; `fetchRoadmapBlocks` catches index error and falls back to unordered `.get()` |
| PDF embed blocked by browser security | High | Medium | Render fallback `<a>` download link alongside the iframe |
| YouTube embed fails (network / region) | Low | Medium | Render thumbnail + link fallback if iframe fires onerror |
| Text block XSS via admin content | Low | High | `sanitizeHtml()` in T-07 strips dangerous tags and attributes before any innerHTML assignment |
| localStorage quota exceeded | Very Low | Low | All `localStorage` calls wrapped in try/catch (consistent with existing pattern in `subjects-catalog.js`) |
| `user_progress` subcollection blocked by catch-all rule | Medium | High | Explicitly addressed in T-02 — explicit rule must appear before the existing deny-all |
| Admin reorder race condition (two admins simultaneously) | Very Low | Low | Acceptable for V0.2; use Firestore transactions in future if concurrent admin editing becomes a requirement |
