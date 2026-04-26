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
