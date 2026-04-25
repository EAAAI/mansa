# Runtime Entrypoint Map

## Purpose
Defines the current runtime entrypoint for each primary page during refactor.

## Rule
Each page must load exactly one local page module entrypoint.

## Current Map

| Page | Entrypoint Module | Notes |
|------|-------------------|-------|
| index.html | src/js/pages/index-page.js | Inline JS extracted |
| admin-dashboard.html | src/js/pages/admin-dashboard-page.js | Inline JS extracted |
| suggest.html | src/js/pages/suggest-page.js | Inline JS extracted |
| join-us.html | src/js/pages/join-us-page.js | Inline JS extracted |
| maintenance.html | src/js/pages/maintenance-page.js | Inline JS extracted |

## Secondary Pages

| Page | Entrypoint Module | Notes |
|------|-------------------|-------|
| ahmed.html | src/js/pages/ahmed-page.js | Theme bootstrap moved from inline JS |
| ibrahim.html | src/js/pages/ibrahim-page.js | Theme bootstrap moved from inline JS |
