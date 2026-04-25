# Security Audit and Action Plan - MANSA

Last updated: 2026-04-25

## Scope
Reviewed runtime and core project files including:
- Frontend runtime pages and modules
- API relay endpoint
- Firebase config/auth wiring
- Service worker caching strategy
- Tooling scripts and docs

## Summary
Current risk posture: High

Reason:
- Secrets are exposed in frontend code.
- Several rendering paths use unsafe HTML injection with user-controlled values.
- Admin trust model is primarily client-side.
- Contact endpoint can be abused without rate limiting/validation hardening.

---

## Findings by severity

### Critical 1 - Hard-coded secrets in frontend JavaScript
Files:
- src/js/config/firebase.js
- src/js/features/essay.js
- src/js/features/user-profile.js

Impact:
- Immediate credential leakage and possible quota/abuse against third-party AI services.
- Keys should be treated as compromised and rotated.

Action:
1. Rotate all leaked keys.
2. Remove secrets from client code.
3. Proxy AI requests through backend endpoints using environment variables.

---

### Critical 2 - User-controlled HTML rendered with innerHTML
Files (examples):
- src/js/pages/admin-dashboard-page.js
- src/js/pages/home.js
- src/js/features/user-profile.js

Impact:
- Stored or reflected script injection risk through manipulated local storage or remote data.

Action:
1. Replace innerHTML for user data paths with textContent and DOM node creation.
2. Where formatted output is needed, apply strict escaping/sanitization.

---

### Critical 3 - Frontend-only admin trust boundary
Files:
- src/js/config/firebase.js
- admin-dashboard.html
- src/js/pages/admin-dashboard-page.js

Impact:
- Authorization checks in client can be bypassed by modified runtime.
- Sensitive admin operations should be protected server-side.

Action:
1. Move authorization decisions to backend or secured rules/claims.
2. Use role claims and rule-enforced reads/writes for admin data.

---

### High 1 - Contact endpoint missing anti-abuse controls
File:
- api/contact.js

Impact:
- Spam, denial of service attempts, and operational noise.

Action:
1. Add schema validation.
2. Add payload size constraints.
3. Add IP/user-agent rate limiting.
4. Add origin allow-list and optional captcha verification.

---

### High 2 - Operational data stored in localStorage
Files:
- suggest.html and src/js/pages/suggest-page.js
- src/js/pages/join-us-page.js
- src/js/pages/admin-dashboard-page.js

Impact:
- Data can be tampered with and is not trustworthy.

Action:
1. Move operational submissions to backend store.
2. Restrict admin views to trusted backend records.

---

### Medium 1 - Hardcoded absolute paths in tooling scripts
Files:
- update_data.py
- update_admin.py

Impact:
- Unsafe and non-portable maintenance workflow.

Action:
1. Replace hardcoded paths with repository-relative paths.
2. Add safe dry-run mode and path validation.

---

## Security implementation phases

### Phase S1 - 24 hour containment
- Revoke and rotate leaked secrets.
- Remove exposed keys from frontend files.
- Deploy temporary server-side proxy for AI calls.

Exit criteria:
- Secret scan finds no live API secrets in repository.

### Phase S2 - 3 day hardening
- Replace unsafe innerHTML paths for user-controlled content.
- Add input validation and abuse controls to api/contact.js.

Exit criteria:
- Security test cases for XSS and malformed payloads pass.

### Phase S3 - 1 week trust model fix
- Move admin trust to backend-enforced roles/rules.
- Move operational submissions to trusted storage.

Exit criteria:
- Admin-only data paths enforced server-side.

---

## Validation checklist
- Secret scanning passes.
- XSS payload tests do not execute scripts in admin/user views.
- Contact endpoint rejects oversized or invalid payloads.
- Rate limit behavior confirmed in test.
- Admin access fails for non-privileged users even if frontend code is altered.

---

## Notes
- Firebase web app keys can be public in principle, but AI keys and bearer tokens must never be shipped to client runtime.
- Existing leaked AI keys should be considered compromised regardless of repository privacy.
