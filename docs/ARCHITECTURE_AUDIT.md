# Architecture Audit - MANSA

## Purpose
This document records the current architecture state of the project before refactoring.

Scope of this audit:
- Project structure and file organization
- Separation of concerns between HTML, CSS, and JavaScript
- Runtime wiring (what is actually loaded in pages)
- Documentation and implementation drift

Out of scope for this phase:
- API and security concerns (intentionally excluded for now)

---

## 1. Current Architecture Snapshot

The codebase currently uses a mixed architecture:

- A page-centric runtime with large inline scripts/styles in HTML pages
- A module-centric structure under `src/js` and `src/css` that is only partially wired

Result: the repository contains two architecture styles at once, but only one is effectively active at runtime.

### What is actively wired in pages

- `index.html` loads:
  - Tailwind browser runtime from CDN
  - `src/js/config/firebase.js`
  - Large inline script block for popup behavior and theme toggle
- `admin-dashboard.html` loads:
  - Firebase compat SDKs from CDN
  - `src/js/config/firebase.js`
  - Large inline script block for auth UI and dashboard rendering
- `suggest.html`, `join-us.html`, `maintenance.html`:
  - Page-local inline scripts and styles

### What exists but is not wired as primary runtime

- `src/js/main.js` and many modules under `src/js/utils`, `src/js/features`, `src/js/pages`
- `src/css/components/shared.css` and large theme/style layers that do not cleanly map to current HTML structure

---

## 2. Structural Problems (Pinpointed)

## P1 - Mixed Paradigms Without a Single Source of Truth

The project simultaneously keeps:
- Inline page logic (current runtime)
- ES module architecture (partially orphaned)

Impact:
- New changes can be implemented in one path and silently not affect real behavior
- Higher maintenance cost and onboarding confusion

Evidence:
- `index.html` inline runtime
- `src/js/main.js` exists but is not imported by any HTML page

---

## P2 - Weak Separation of Concerns in HTML Pages

Several pages contain substantial embedded CSS and JS:
- `index.html`
- `admin-dashboard.html`
- `suggest.html`
- `join-us.html`
- `maintenance.html`

Impact:
- Hard to test and reuse behavior
- Hard to style consistently across pages
- Increases merge conflicts and accidental regressions

---

## P3 - CSS Architecture Is Fragmented

The project has:
- Tailwind-in-page usage in `index.html`
- Legacy custom CSS in `src/css/pages/home.css`
- Additional inline style blocks per page

Impact:
- No clear styling ownership model
- Duplicate tokens/components likely over time
- Difficult to enforce design consistency

---

## P4 - JavaScript Module Layer Is Partially Orphaned

Modules like these are present:
- `src/js/main.js`
- `src/js/utils/navbar.js`
- `src/js/utils/themes.js`
- `src/js/utils/scroll.js`
- `src/js/pages/home.js`
- `src/js/features/essay.js`

But page wiring does not consistently use them.

Impact:
- Dead or semi-dead code paths
- False sense of architecture maturity
- Refactor risk increases because execution path is unclear

---

## P5 - Documentation Drift vs Implementation

`docs/DEVELOPER_GUIDE.md` documents files and flows that do not exist in the current workspace, such as:
- `subject.html`
- `src/js/subject-main.js`
- `src/js/config/subjects.js`
- `src/js/utils/leaderboard.js`
- `src/js/features/ai-chat.js`
- `src/js/features/challenge.js`

Impact:
- New contributors follow incorrect instructions
- Architectural decisions become inconsistent across contributors

---

## P6 - Service Worker Cache Manifest Drift

`service-worker.js` pre-caches multiple resources that are not present in the current repository (same missing set as above).

Impact:
- Offline/cache behavior becomes unreliable
- Confusing runtime failures during install/cache phases

---

## P7 - Data Layer Is Defined But Not Clearly Integrated

Data files exist under `src/data/*-data.js` and schema helpers in `src/data/questions-schema.js`, but active page runtime does not clearly consume them as a central data source.

Impact:
- Unclear content ownership model
- Difficulty deciding where feature logic should read/write content

---

## P8 - Tooling Scripts Are Environment-Coupled

Utility scripts:
- `update_data.py`
- `update_admin.py`

contain hardcoded absolute paths to a different environment.

Impact:
- Tooling cannot run reliably for other contributors
- Automation cannot be trusted in CI or on different machines

---

## P9 - Boundary Definitions Are Missing

There is no explicitly documented boundary for:
- Page composition layer
- UI components layer
- Feature/domain logic layer
- Data access layer

Impact:
- Logic placement decisions are ad hoc
- Architecture entropy increases with each feature

---

## 3. Where the Project Stands Architecturally

Current state can be summarized as:

- Runtime style: page-local, inline-driven
- Intended style: modular, layered frontend
- Gap: significant drift between intended and actual execution architecture

This is the core reason the project feels "bulk vibe coding" and hard to maintain.

---

## 4. Refactor Readiness Notes (No Plan Yet)

Before planning fixes, this baseline should be treated as canonical:

- Confirm which architecture direction to keep:
  - Option A: modular ES-module frontend
  - Option B: page-centric static pages with strict extraction rules
- Decide the ownership of each page and each feature module
- Freeze the runtime entry-point map (one definitive map)

After this, we can produce a phased refactor plan with minimal breakage.

---

## 5. Evidence Index

Primary files reviewed for this audit:

- `index.html`
- `admin-dashboard.html`
- `suggest.html`
- `join-us.html`
- `maintenance.html`
- `service-worker.js`
- `docs/DEVELOPER_GUIDE.md`
- `src/js/main.js`
- `src/js/utils/navbar.js`
- `src/js/utils/themes.js`
- `src/js/utils/scroll.js`
- `src/js/pages/home.js`
- `src/js/features/essay.js`
- `src/css/pages/home.css`
- `src/css/components/shared.css`
- `src/css/features/essay.css`
- `src/data/questions-schema.js`
- `src/data/*-data.js`
- `update_data.py`
- `update_admin.py`