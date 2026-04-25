# Architecture Refactor Plan - MANSA

## Purpose
This plan converts the findings in `ARCHITECTURE_AUDIT.md` into an implementation sequence.

Scope:
- Architecture and project structure
- Separation of concerns (HTML, CSS, JS)
- Runtime wiring consistency
- Documentation and cache-manifest alignment

Out of scope for this plan:
- API and security hardening work (intentionally postponed)

---

## 1. Target Architecture (Decision)

Adopt **module-first frontend architecture** with thin HTML shells.

Principles:
- HTML files contain structure only (minimal inline behavior)
- CSS lives in `src/css/**` (no page-level large inline styles)
- JS logic lives in `src/js/**` and is imported through page entry files
- One entry-point module per HTML page
- No duplicate behavior across inline scripts and modules

Why this direction:
- Matches existing `src/js` and `src/css` investment
- Reduces drift and hidden runtime paths
- Makes features testable and reusable

---

## 2. Planned Layer Boundaries

## 2.1 Page Composition Layer
- Responsibility: wire page sections and initialize features
- Location: `src/js/pages/*`

## 2.2 Feature Layer
- Responsibility: domain behaviors (popups, admin tabs, challenges, profile)
- Location: `src/js/features/*`

## 2.3 Shared UI/Utility Layer
- Responsibility: pure helpers and shared UI services
- Location: `src/js/utils/*`

## 2.4 Styling Layer
- Responsibility: visual system and page/component styles
- Location: `src/css/components/*`, `src/css/pages/*`, `src/css/features/*`, `src/css/themes/*`

## 2.5 Data Contract Layer
- Responsibility: static schemas and local content contracts
- Location: `src/data/*`

---

## 3. Migration Strategy

Use **strangler migration** page by page:
- Extract behavior from one page at a time
- Replace inline JS with imported module entrypoint
- Keep behavior parity before moving to next page

Order by highest architectural impact first:
1. `index.html`
2. `admin-dashboard.html`
3. `suggest.html`
4. `join-us.html`
5. `maintenance.html`
6. profile pages (`ahmed.html`, `ibrahim.html`)

---

## 4. Execution Phases

## Phase 0 - Freeze and Baseline
Goal: lock current behavior and establish refactor guardrails.

Tasks:
- Record current runtime map (page -> scripts/styles loaded)
- Define naming conventions for page entry modules
- Define "no-new-inline-logic" rule

Deliverables:
- Runtime map table in docs
- Contribution note for architecture constraints

Exit criteria:
- Team agrees on target architecture and naming conventions

---

## Phase 1 - Entry-Point Wiring Standardization
Goal: create one JS entry module per page and wire via `type="module"`.

Tasks:
- Add page entry files:
  - `src/js/pages/index-page.js`
  - `src/js/pages/admin-dashboard-page.js`
  - `src/js/pages/suggest-page.js`
  - `src/js/pages/join-us-page.js`
  - `src/js/pages/maintenance-page.js`
- Replace inline runtime bootstrapping in each HTML with entry module import

Deliverables:
- Deterministic runtime entrypoint per page

Exit criteria:
- Every page initializes through exactly one page module

---

## Phase 2 - JavaScript Extraction and Feature Modularization
Goal: move inline scripts into dedicated feature modules.

Tasks by page:

### `index.html`
- Extract popup logic (suggest/report/join) to `src/js/features/contact-popups.js`
- Extract page theme toggle to `src/js/features/theme-toggle.js`
- Keep `index.html` to markup + event hooks from module

### `admin-dashboard.html`
- Extract auth screen and tab rendering to `src/js/features/admin-dashboard-ui.js`
- Remove direct dependence on global implicit `event` in tab switching

### `suggest.html` and `join-us.html`
- Extract submit/reset/tab logic to page feature modules
- Share repeated local-storage helper functions in `src/js/utils/storage.js`

### `maintenance.html`
- Move particle/audio scripts to page module

Deliverables:
- Inline script blocks reduced to near zero

Exit criteria:
- Page behavior parity preserved after extraction
- No duplicate logic between HTML and module files

---

## Phase 3 - CSS Decomposition and Ownership Cleanup
Goal: remove large inline style blocks and define clear style ownership.

Tasks:
- Extract per-page inline CSS to:
  - `src/css/pages/index.css`
  - `src/css/pages/admin-dashboard.css`
  - `src/css/pages/suggest.css`
  - `src/css/pages/join-us.css`
  - `src/css/pages/maintenance.css`
- Keep shared tokens/utilities in `src/css/components/shared.css`
- Preserve feature-specific styles in `src/css/features/*`

Deliverables:
- HTML pages with minimal inline style usage
- Page styles discoverable by file name

Exit criteria:
- Style source of truth is entirely in `src/css/**`

---

## Phase 4 - Orphan/Legacy Reconciliation
Goal: resolve dead references and archive/remove unowned code paths.

Tasks:
- Identify modules not used by any page entry module
- Decide for each: integrate, archive, or remove
- Align `service-worker.js` cache list with real files only

Deliverables:
- Clean runtime graph
- No references to missing files in cache manifest

Exit criteria:
- All cached assets exist
- All module files have a clear owner and usage status

---

## Phase 5 - Documentation Alignment
Goal: remove docs drift and codify architecture rules.

Tasks:
- Update `docs/DEVELOPER_GUIDE.md` to match real structure
- Add architecture conventions section:
  - page entrypoint rule
  - no-inline-logic rule
  - where new feature code goes
  - where new styles go

Deliverables:
- Accurate developer documentation

Exit criteria:
- New contributor can follow docs and run correct architecture flow

---

## 5. File-Level Work Packages

## WP-A: Runtime Shell Pages
- `index.html`
- `admin-dashboard.html`
- `suggest.html`
- `join-us.html`
- `maintenance.html`

Objective:
- convert to thin shell pages (structure only + module includes)

## WP-B: JS Module Graph
- `src/js/pages/*`
- `src/js/features/*`
- `src/js/utils/*`

Objective:
- single initialization path and no duplicate logic paths

## WP-C: CSS Ownership
- `src/css/pages/*`
- `src/css/components/shared.css`
- `src/css/features/*`
- `src/css/themes/*`

Objective:
- explicit style ownership and reduced duplication

## WP-D: Drift Repairs
- `service-worker.js`
- `docs/DEVELOPER_GUIDE.md`

Objective:
- implementation/docs/cache alignment

---

## 6. Acceptance Criteria (Project-Level)

Architecture refactor is considered complete when:
- Every HTML page has one `type="module"` entrypoint
- Inline scripts are removed or limited to tiny bootstrapping only
- Inline style blocks are removed except truly page-critical micro styles
- `service-worker.js` has no missing-file references
- `docs/DEVELOPER_GUIDE.md` reflects real project structure
- No duplicated business logic exists between HTML and `src/js` modules

---

## 7. Suggested Implementation Cadence

Cadence by iteration:
- Iteration 1: Phase 0 + Phase 1 (wiring standard)
- Iteration 2: Phase 2 for `index.html`
- Iteration 3: Phase 2 for `admin-dashboard.html`, `suggest.html`, `join-us.html`
- Iteration 4: Phase 2 for `maintenance.html` + Phase 3 CSS extraction
- Iteration 5: Phase 4 + Phase 5 (cleanup and documentation alignment)

---

## 8. Risks and Mitigations (Architecture Only)

Risk: behavior regression during extraction.
- Mitigation: page-by-page migration with parity checks before next page.

Risk: unfinished dual-runtime period.
- Mitigation: complete each page fully before starting another page.

Risk: style regressions from CSS moves.
- Mitigation: move CSS without visual redesign first, then optimize later.

---

## 9. Next Step

Run **stabilization and maintenance pass**:
- Keep architecture docs in sync as pages/features evolve
- Prevent reintroduction of large inline scripts/styles
- Consolidate duplicated CSS declarations where safe without visual changes
- Track any future architecture work in `docs/ARCHITECTURE_EXECUTION_STATUS.md`
