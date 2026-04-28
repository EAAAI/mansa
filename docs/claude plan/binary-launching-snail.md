# Mansa Cleanup: Strip to Core Dynamic Pages System

## Context

The project has accumulated dead code, orphaned files, and architectural issues. The user wants ONLY the clean dynamic pages system: index (catalog), subject (detail), admin dashboard, Firebase, and Telegram API. No features, no extras.

**Problems found:**
- 26 orphaned files (HTML, CSS, JS, Python) not used by any core page
- Firestore dual-write from client always fails (rules mismatch) — user chose Telegram-only
- ES modules depend on `db` as a fragile global variable
- subject-page.js loads the entire subjects collection to find one subject
- service-worker.js references 3+ non-existent files
- Verification scripts reference deleted/missing files and will fail
- package.json has unused React dependencies
- Stale docs from old architecture

---

## Phase 1: Delete 26 orphaned files + empty dirs

**HTML** (5): `suggest.html`, `join-us.html`, `ahmed.html`, `ibrahim.html`, `maintenance.html`

**CSS** (8): `src/css/pages/home.css`, `suggest.css`, `join-us.css`, `ahmed.css`, `ibrahim.css`, `maintenance.css`, `src/css/components/shared.css`, `src/css/themes/ramadan.css`

**JS** (11): `src/js/main.js`, `src/js/utils/navbar.js`, `scroll.js`, `themes.js`, `error-handler.js`, `src/js/features/user-profile.js`, `src/js/pages/suggest-page.js`, `join-us-page.js`, `ahmed-page.js`, `ibrahim-page.js`, `maintenance-page.js`

**Python** (2): `update_admin.py`, `update_data.py`

**Empty dirs** (3): `src/css/components/`, `src/css/themes/`, `src/js/utils/`, `src/data/`

**Also delete stale docs**: `docs/ARCHITECTURE_AUDIT.md`, `ARCHITECTURE_CONVENTIONS.md`, `ARCHITECTURE_EXECUTION_STATUS.md`, `ARCHITECTURE_REFACTOR_PLAN.md`, `ARCHITECTURE_WORKLOG.md`, `CONTINUOUS_EXECUTION_LOG.md`, `DEVELOPER_GUIDE.md`, `PROJECT_MASTER_PLAN.md`, `RUNTIME_ENTRYPOINT_MAP.md`, `SECURITY_AUDIT_AND_PLAN.md`

**Keep**: `docs/FIREBASE_SUBJECTS_SETUP.md`, `FIRESTORE_RULES_TEMPLATE.md`, `PREDEPLOY_CHECKLIST.md`

---

## Phase 2: Convert firebase.js to ES module

**File**: `src/js/config/firebase.js`

- Remove `dbLeaderboard` and `dbAnalytics` aliases (dead leftovers)
- Remove `initFirebase()` wrapper — init at top level
- Remove all `window.*` assignments
- Add `export { db, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged }`

**File**: `src/js/features/subjects-catalog.js`
- Add `import { db } from '../config/firebase.js'`
- Change `typeof db === 'undefined' || !db` → `!db`

**File**: `src/js/pages/admin-dashboard-page.js`
- Add `import { db, initAuth, signInWithGoogle, hasAdminClaim, adminSignOut, onAuthStateChanged } from '../config/firebase.js'`
- Change `dbAnalytics` → `db` everywhere
- Change `typeof db === 'undefined' || !db` → `!db`
- Remove `typeof hasAdminClaim !== 'function'` check (now always in scope)

**HTML** (all 3 pages): Remove `<script src="src/js/config/firebase.js"></script>` — the module system handles it now

---

## Phase 3: Remove Firestore dual-write from index-page.js

**File**: `src/js/pages/index-page.js`

- Delete `persistAdminSubmission()` function entirely
- Simplify `submitPopupSuggest`, `submitPopupReport`, `submitPopupJoin`:
  - POST to `/api/contact` only
  - On failure: save to localStorage
  - No Firestore client write

---

## Phase 4: Optimize subject page loading

**File**: `src/js/features/subjects-catalog.js`
- Add `loadSingleSubject(subjectId)` — single doc read from `subjects/{id}` instead of full collection scan
- Export it

**File**: `src/js/pages/subject-page.js`
- Import `loadSingleSubject` instead of `loadSubjectsCatalog` + `getSubjectById`
- Replace catalog scan with single doc fetch

---

## Phase 5: Simplify Firestore rules

**File**: `firestore.rules`
- Remove all submission validation helpers (`hasKeys`, `isShortString`, `isSubmissionTimestamp`, `isSuggestionSubmission`, etc.)
- Remove `users` collection rule (user-profile.js is deleted)
- Simplify `admin_submissions` to admin-only read/write

---

## Phase 6: Clean up index.html

- Remove CV nav links (cv/index.html doesn't exist)
- Replace ahmed.html/ibrahim.html links with plain `<span>` text

---

## Phase 7: Fix service-worker.js

- Strip cache list to only the 13 core files
- Bump cache version to v8

---

## Phase 8: Update verification scripts

**`scripts/verify-integrity.mjs`**: Remove references to deleted/missing files (`ai-nickname.js`, `ai-essay-grade.js`, `user-profile.js`, `essay.js`, seed files). Keep checks for remaining core files.

**`scripts/verify-smoke.mjs`**: Remove deleted pages from `expectedPages`, remove missing APIs from `expectedApis`, remove seed validation functions.

---

## Phase 9: Clean package.json and .env.example

**package.json**: Remove unused deps (`@vercel/analytics`, `framer-motion`, `lucide-react`). Keep `firebase-admin`.

**.env.example**: Remove AI provider section (GROQ/GEMINI keys). Keep only ALLOWED_ORIGINS and TELEGRAM vars.

---

## Verification

1. `npm run verify` — updated integrity checks pass
2. `npm run verify:smoke` — updated smoke tests pass  
3. `npm run verify:secrets` — no secrets exposed
4. Manual: `npm start` → open index.html, subjects load from Firebase, popups work
5. Manual: `subject.html?subject=<id>` loads single subject
6. Manual: admin-dashboard.html shows login screen
7. Console: no module import errors on any page
