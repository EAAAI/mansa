# Pre-Deploy Checklist

Use this checklist before publishing any production update.

## 1. Environment and Secrets

1. Confirm production env vars exist:
   - `ALLOWED_ORIGINS`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - optional model overrides
2. Confirm no API secrets are present in frontend JS files.
3. Rotate provider keys after any exposure incident.

## 2. API Security

1. Verify `/api/contact`, `/api/ai-nickname`, `/api/ai-essay-grade` respond correctly.
2. Verify 403 for blocked origins and 429 for rate-limit bursts.
3. Verify bad payloads return 400 and never crash endpoint.

## 3. Firebase and Data

1. Ensure Firestore rules are deployed and reviewed:
   - Use [firestore.rules](../firestore.rules) as the deploy target.
   - Use `docs/FIRESTORE_RULES_TEMPLATE.md` as the review baseline.
2. Confirm admin custom claims are assigned before enabling dashboard access.
3. Seed dynamic subject data if needed:
   - Use `docs/FIREBASE_SUBJECTS_SETUP.md`.
4. Verify `subjects` and `subject_pages` document IDs match route ids.

## 4. Frontend Runtime

1. Open `index.html` and confirm subject cards load.
2. Open `subject.html?subject=physics2` and verify details render.
3. Verify popups/forms submit through `/api/contact`.
4. Verify admin dashboard login and seed action work with a user that has `admin: true` custom claim.

## 5. Caching and Offline

1. Confirm `service-worker.js` cache version changed when new assets are added.
2. Confirm new runtime assets are listed in `urlsToCache`.
3. Test hard refresh and offline fallback behavior.

## 6. Final QA

1. Check browser console for runtime errors.
2. Run editor diagnostics and ensure no new blocking issues.
3. Run `npm run verify:ci` and ensure it passes.
4. Confirm documentation updates are included for new features.
5. Validate Arabic text rendering and mobile layout.

## 7. Roadmap Feature (V0.2)

### Firestore Index

1. Confirm `firestore.indexes.json` is committed to the repo.
2. Deploy index with:
   ```bash
   firebase deploy --only firestore
   ```
3. Verify the composite index `(subjectId ASC, order ASC)` appears as **Enabled**
   in the Firebase Console → Firestore → Indexes.

> **Risk:** If the index is not deployed, `fetchRoadmapBlocks` silently falls back
> to an unordered query. Blocks may appear out of order for subjects with many steps.

### Firestore Rules

1. Verify `firestore.rules` includes the `roadmap_blocks` match block **before**
   the catch-all `/{document=**}` deny rule.
2. Deploy rules with:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Test: open `subject.html?subject=<id>` and confirm no `PERMISSION_DENIED` errors
   in the browser console.

### Content Seeding

1. Log in to the admin dashboard with an account that has the `admin: true` custom claim.
2. Switch to the **🗺️ خرائط المذاكرة** tab.
3. Select a subject and add at least one block of each type (video, PDF, text).
4. Open `subject.html?subject=<id>` and confirm the roadmap section appears.

### Student Progress (localStorage)

1. Mark a block as Done — confirm the block transitions to green ✓ state.
2. Hard-refresh the page — confirm the Done state persists from localStorage.
3. Open browser DevTools → Application → Local Storage → confirm key
   `mansa_roadmap_progress_<subjectId>` exists with the correct structure.

### Mobile Smoke Test

1. Open `subject.html` at 390px viewport width.
2. Confirm video embeds maintain 16:9 ratio (no horizontal overflow).
3. Confirm PDF "open in new tab" fallback link is visible.
4. Confirm the Done button is full-width and easily tappable.
