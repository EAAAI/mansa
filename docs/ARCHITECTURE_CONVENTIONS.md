# Architecture Conventions

## Scope
Architecture and separation-of-concerns conventions for frontend refactor.

## Core Rules
- One page, one local module entrypoint.
- No new large inline script blocks in HTML.
- No new large inline style blocks in HTML.
- HTML should focus on structure and semantic markup.
- Business logic belongs in src/js/features or src/js/pages.
- Shared helpers belong in src/js/utils.
- Page styles belong in src/css/pages.
- Shared styles/tokens belong in src/css/components.

## File Ownership
- src/js/pages: page bootstrap and orchestration.
- src/js/features: feature/domain behavior.
- src/js/utils: cross-feature utility code.
- src/css/pages: page-specific presentation.
- src/css/features: feature-specific presentation.
- src/css/components: shared design primitives.

## Migration Guardrails
- Preserve behavior before optimizing structure.
- Complete one page migration before starting the next page.
- Remove duplicate logic after module extraction is validated.
- Keep docs updated when files move or are retired.

## Definition of Done for a Migrated Page
- Page has one module entrypoint.
- Inline script reduced to none or tiny bootstrap only.
- Inline style reduced to none or tiny critical style only.
- Runtime behavior matches pre-migration behavior.
