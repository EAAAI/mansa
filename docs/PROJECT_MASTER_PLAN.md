# Project Master Plan - MANSA

Last updated: 2026-04-25

## Why this plan exists
This is the single execution plan for architecture, security, quality, and delivery.

Planning method used:
- Pass 1: Risk-first planning (what can break users or security now)
- Pass 2: Structure-first planning (how to improve maintainability without regressions)

## Current checkpoint
Architecture checkpoint status:
- Page-entry architecture: complete after restoring suggest page wiring
- Runtime/docs/cache alignment: complete
- Allowed next phase: security hardening

Rule for progression:
- Do not move to the next phase until the current phase gate is marked complete.

---

## Phase 0 - Baseline Freeze (Completed)
Goal:
- Stabilize page runtime architecture and remove inline runtime drift.

Completed outputs:
- One module entrypoint per page under src/js/pages
- Page CSS ownership under src/css/pages
- Service worker cache drift fixed
- Architecture docs and worklog established

Gate:
- Completed

---

## Phase 1 - Security Hotfixes (Highest Priority)
Goal:
- Remove immediate exploitable risks and key leakage.

Tasks:
1. Remove hard-coded secret API keys from frontend JavaScript.
2. Rotate compromised keys (Groq, Gemini, any leaked tokens).
3. Move AI calls to server-side endpoints that read secrets from environment variables.
4. Add request validation and payload limits to api/contact.js.
5. Add anti-abuse controls for api/contact.js:
   - rate limiting
   - origin checks
   - optional captcha
6. Replace risky innerHTML usage where user-controlled values are rendered.
7. Define admin authorization as server-validated policy (not frontend-only checks).

Gate:
- No secret keys committed in repository.
- Contact API rejects malformed/oversized payloads.
- Basic abuse protection active.
- Security smoke test checklist passes.

---

## Phase 2 - Architecture Hardening
Goal:
- Keep the architecture consistent and prevent future drift.

Tasks:
1. Add architecture CI checks:
   - no large inline script/style blocks in HTML
   - runtime map consistency check
2. Extract remaining mixed responsibilities in large page modules:
   - split index-page into feature modules
   - split admin-dashboard-page rendering helpers
3. Remove dead legacy modules or clearly mark as archived.
4. Align README and CONTRIBUTING with actual architecture.

Gate:
- CI guardrails catch architecture regressions.
- Docs match live structure.
- No orphan runtime paths in production pages.

---

## Phase 3 - Data Integrity and Storage Model
Goal:
- Replace fragile local-only storage for operational workflows.

Tasks:
1. Define source-of-truth model for:
   - suggestions
   - reports
   - join submissions
2. Move admin-visible records from mutable localStorage to backend storage.
3. Add schema validation for write paths.
4. Add migration path for old local data where needed.

Gate:
- Admin dashboard reads trusted backend data.
- Data contracts documented and enforced.

---

## Phase 4 - Quality, Testing, and Reliability
Goal:
- Reduce regression risk and improve deployment confidence.

Tasks:
1. Add linting and formatting baseline for JS/CSS/HTML.
2. Add minimal automated tests:
   - page boot smoke tests
   - form flow tests
   - API endpoint tests
3. Add release checklist and rollback checklist.
4. Review service worker update strategy for safer cache invalidation.

Gate:
- CI quality checks pass.
- Regression test set covers critical user flows.

---

## Phase 5 - Product and Feature Growth
Goal:
- Build new features on a stable and secure base.

Tasks:
1. Prioritize roadmap features after security and quality gates.
2. Add observability hooks for errors and key user flows.
3. Introduce staged releases for risky changes.

Gate:
- Feature delivery can proceed with documented release safety checks.

---

## Risk register (active)
Critical risks:
- Secret keys exposed in frontend code.
- User-controlled content rendered with innerHTML in multiple files.
- Frontend-only admin authorization model.
- Contact endpoint has no anti-abuse controls.

High risks:
- LocalStorage as operational data source for admin workflows.
- Tooling scripts tied to hardcoded absolute paths.
- Documentation drift can reintroduce architecture regressions.

---

## Recommended immediate sequence
1. Execute Phase 1 Security Hotfixes first.
2. Re-run architecture and security validations.
3. Enter Phase 2 hardening only after Phase 1 gate is complete.

## Owner checkpoint format
For each phase completion, record:
- Date
- Files changed
- Validation commands/results
- Open risks
