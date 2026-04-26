# MANSA Developer Guide

Architecture-first guide for maintaining and extending the current codebase.

---

## 1. Current Architecture

The project now follows a page-module runtime pattern:
- Each HTML page loads exactly one local module entrypoint.
- Inline JavaScript in HTML pages is removed.
- Page behavior is owned by `src/js/pages/*`.

### Runtime Entrypoints

| HTML Page | Entrypoint Module |
|---|---|
| `index.html` | `src/js/pages/index-page.js` |
| `subject.html` | `src/js/pages/subject-page.js` |
| `admin-dashboard.html` | `src/js/pages/admin-dashboard-page.js` |
| `suggest.html` | `src/js/pages/suggest-page.js` |
| `join-us.html` | `src/js/pages/join-us-page.js` |
| `maintenance.html` | `src/js/pages/maintenance-page.js` |
| `ahmed.html` | `src/js/pages/ahmed-page.js` |
| `ibrahim.html` | `src/js/pages/ibrahim-page.js` |

Use `docs/RUNTIME_ENTRYPOINT_MAP.md` as the source of truth.

---

## 2. Project Structure

```text
mansa/
├── index.html
├── subject.html
├── admin-dashboard.html
├── suggest.html
├── join-us.html
├── maintenance.html
├── ahmed.html
├── ibrahim.html
├── service-worker.js
├── api/
│   └── contact.js
├── src/
│   ├── js/
│   │   ├── config/
│   │   │   └── firebase.js
│   │   │   └── subjects-config.js
│   │   ├── features/
│   │   │   ├── essay.js
│   │   │   ├── subjects-catalog.js
│   │   │   └── user-profile.js
│   │   ├── pages/
│   │   │   ├── index-page.js
│   │   │   ├── subject-page.js
│   │   │   ├── admin-dashboard-page.js
│   │   │   ├── suggest-page.js
│   │   │   ├── join-us-page.js
│   │   │   ├── maintenance-page.js
│   │   │   ├── ahmed-page.js
│   │   │   ├── ibrahim-page.js
│   │   │   └── home.js
│   │   ├── utils/
│   │   │   ├── error-handler.js
│   │   │   ├── navbar.js
│   │   │   ├── scroll.js
│   │   │   └── themes.js
│   │   └── main.js
│   ├── css/
│   │   ├── components/
│   │   │   └── shared.css
│   │   ├── features/
│   │   │   ├── essay.css
│   │   │   └── katex.css
│   │   ├── pages/
│   │   │   ├── home.css
│   │   │   ├── index.css
│   │   │   ├── subject.css
│   │   │   ├── admin-dashboard.css
│   │   │   ├── suggest.css
│   │   │   ├── join-us.css
│   │   │   ├── maintenance.css
│   │   │   ├── ahmed.css
│   │   │   └── ibrahim.css
│   │   └── themes/
│   │       └── ramadan.css
│   └── data/
│       ├── questions-schema.js
│       └── *-data.js
└── docs/
    ├── ARCHITECTURE_AUDIT.md
    ├── ARCHITECTURE_REFACTOR_PLAN.md
    ├── ARCHITECTURE_CONVENTIONS.md
    └── RUNTIME_ENTRYPOINT_MAP.md
```

---

## 3. Layer Ownership

- `src/js/pages/*`: page bootstrap and orchestration.
- `src/js/features/*`: feature/domain behavior shared across pages.
- `src/js/utils/*`: generic cross-feature helpers.
- `src/css/pages/*`: page-specific styling.
- `src/css/components/*`: shared styles and design tokens.
- `src/css/features/*`: feature-specific styling.
- `src/data/*`: static content contracts and datasets.

---

## 4. Architecture Rules

- Keep one page entrypoint module per HTML page.
- Do not add new large inline `<script>` blocks.
- Do not duplicate runtime logic between HTML and JS modules.
- Keep docs and cache manifest aligned with existing files.

Detailed rules are in `docs/ARCHITECTURE_CONVENTIONS.md`.

---

## 5. Service Worker Notes

`service-worker.js` now pre-caches only files that currently exist.

When adding/removing runtime-critical files:
1. Update `urlsToCache`.
2. Increment `CACHE_NAME` version.
3. Validate offline behavior.

---

## 6. How To Add A New Page (Architecture-Safe)

1. Create `new-page.html`.
2. Create `src/js/pages/new-page.js` and initialize from `DOMContentLoaded`.
3. Import it from HTML with:

```html
<script type="module" src="src/js/pages/new-page.js"></script>
```

4. Add the page and entrypoint to `docs/RUNTIME_ENTRYPOINT_MAP.md`.
5. If needed for offline behavior, add both paths to `service-worker.js` and bump cache version.

---

## 7. Development Commands

```bash
# Python static server
python -m http.server 8000

# Node static server
npx serve .

# Integrity checks (security + dynamic subjects)
npm run verify

# Runtime/data smoke checks
npm run verify:smoke

# Secret scan and full CI-equivalent checks
npm run verify:secrets
npm run verify:ci
```

---

## 8. Dynamic Subject Operations

### Seed from Admin Dashboard

1. Login to `admin-dashboard.html` with an allowed admin account.
2. Use the **Seed Subjects Data** button in the data tools panel.
3. The action reads:
    - `src/data/firebase-seed/subjects.catalog.json`
    - `src/data/firebase-seed/subject-pages.json`
4. It upserts documents into:
    - `subjects`
    - `subject_pages`

### Related Ops Docs

- `docs/FIREBASE_SUBJECTS_SETUP.md`
- `docs/FIRESTORE_RULES_TEMPLATE.md`
- `docs/PREDEPLOY_CHECKLIST.md`

### CI Quality Gate

- Workflow: `.github/workflows/quality-gates.yml`
- Local equivalent command: `npm run verify:ci`

---

## 9. Status Snapshot

- JavaScript refactor phases (0-2): complete.
- CSS decomposition (phase 3): complete.
- Runtime and cache manifest drift repairs (phase 4): complete.
- Documentation alignment (phase 5): complete.
