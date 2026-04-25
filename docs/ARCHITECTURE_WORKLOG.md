# Architecture Worklog

Last updated: 2026-04-25

## Purpose
Chronological record of architecture-only changes applied during the refactor program.

## 2026-04-25 - Full Architecture Refactor Execution

### Discovery and Planning
- Performed repo-wide architecture audit covering runtime wiring, separation of concerns, and docs drift.
- Authored architecture baseline docs:
  - `docs/ARCHITECTURE_AUDIT.md`
  - `docs/ARCHITECTURE_REFACTOR_PLAN.md`
  - `docs/ARCHITECTURE_CONVENTIONS.md`
  - `docs/RUNTIME_ENTRYPOINT_MAP.md`

### Phase 1 - Entrypoint Standardization
- Added/standardized page entrypoint modules:
  - `src/js/pages/index-page.js`
  - `src/js/pages/admin-dashboard-page.js`
  - `src/js/pages/suggest-page.js`
  - `src/js/pages/join-us-page.js`
  - `src/js/pages/maintenance-page.js`
  - `src/js/pages/ahmed-page.js`
  - `src/js/pages/ibrahim-page.js`
- Wired all HTML pages to one local `type="module"` entrypoint each.

### Phase 2 - Inline JavaScript Extraction
- Extracted runtime logic from inline scripts into page modules for:
  - `index.html`
  - `admin-dashboard.html`
  - `suggest.html`
  - `join-us.html`
  - `maintenance.html`
  - `ahmed.html`
  - `ibrahim.html`
- Removed inline JavaScript blocks after parity-preserving extraction.

### Phase 4 - Drift Reconciliation
- Reconciled stale cache entries in `service-worker.js`.
- Updated cache key to `mansa-cache-v6`.
- Ensured cached file list only references existing workspace files.

### Phase 5 - Documentation Alignment
- Replaced outdated developer guide with architecture-accurate guide:
  - `docs/DEVELOPER_GUIDE.md`
- Updated runtime entrypoint map to include all active pages.
- Added execution tracker:
  - `docs/ARCHITECTURE_EXECUTION_STATUS.md`

### Phase 3 - CSS Decomposition (Completed)
- Created page-owned stylesheets:
  - `src/css/pages/index.css`
  - `src/css/pages/admin-dashboard.css`
  - `src/css/pages/suggest.css`
  - `src/css/pages/join-us.css`
  - `src/css/pages/maintenance.css`
  - `src/css/pages/ahmed.css`
  - `src/css/pages/ibrahim.css`
- Added stylesheet links in all corresponding HTML pages.
- Removed large inline style blocks from all migrated pages.
- Kept only tiny `text/tailwindcss` variant declarations where currently required by Tailwind browser runtime.
- Performed post-extraction cleanup in `src/css/pages/admin-dashboard.css`:
  - removed orphaned legacy selectors not used by current admin markup.
  - eliminated duplicate style ownership while preserving rendered behavior.

### Validation Results
- Editor diagnostics on touched HTML/JS/CSS files: clean.
- Inline-style scan: no remaining non-tailwind `<style>` blocks in HTML pages.
- Service worker cache path verification: all cached paths exist.

## Notes
- API/security hardening intentionally excluded by scope instruction.
- Physics asset deletions under `questions/physics/` were user-approved and intentionally preserved.

## 2026-04-25 - Runtime Regression Repair

- Detected accidental rollback in `suggest.html` that reintroduced inline `<style>` and inline `<script>` blocks.
- Restored architecture wiring for `suggest.html`:
  - re-added `src/css/pages/suggest.css` link.
  - removed large inline style/script blocks.
  - re-linked `src/js/pages/suggest-page.js` as page entry module.
- Validation:
  - `suggest.html` contains no inline `<style>` or inline runtime `<script>`.
  - editor diagnostics clean for suggest HTML/JS/CSS files.
