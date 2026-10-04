# Task Plan: Eglise Phase 1 SvelteKit PWA prototype

## Goal

Move the fictional-data Phase 1 prototype into a private SvelteKit progressive web application, retaining the public stakeholder site as a separate static experience.

## Phases

- [x] Phase 1: Establish the Phase 1 product plan and UI system.
- [x] Phase 2: Build and review the static fictional-data prototype.
- [x] Phase 3: Define the SvelteKit PWA boundary and project structure.
- [x] Phase 4: Implement the SvelteKit PWA with the same fictional workflows.
- [x] Phase 5: Build, verify, and review the PWA handoff.

## Key Questions

1. How can the app gain component/routing structure without changing the public stakeholder site or adding backend commitments?
2. What PWA behaviour is appropriate for an admin prototype before offline data, login, and real records are approved?
3. Which fictional People & Membership interactions need to survive the migration unchanged?

## Decisions Made

- Phase 1 is a People & Membership pilot; attendance remains separately gated.
- The frontend uses fictional data first. It does not introduce authentication, persistence, real personal data, or deployment.
- The admin shell is an explicit deliverable. People & Membership is active; later modules are visible but muted and honestly labelled.
- UI work follows `docs/ui-guidelines.md`, including the approved palette, type pairing, and temporary decorative background motif.
- Voice transcripts are grouped under `notes/voice/`.
- The existing public stakeholder site remains unchanged. The private application is a self-contained static SvelteKit PWA at `apps/admin`; the superseded standalone admin files are removed after migration verification.
- The prototype uses in-memory fictional fixtures only; refresh resets all state.
- The next prototype iteration is a private SvelteKit PWA under `apps/admin`; this makes the frontend architecture real without selecting the production backend or enabling offline data persistence.
- PWA scope is an installable app shell, manifest, icons, and a conservative offline fallback. It must not cache or persist fictional people data as though it were live data.

## Errors Encountered

- Initial Prettier check reported style differences in the delivery plan; formatted the file and the follow-up check passed.
- Browser verification could not start because the local browser runtime's native component failed macOS code-signature validation. Static checks completed; visual browser verification remains outstanding.
- Playwright's browser binaries are installed, but the sandbox disallows the preview server from binding `127.0.0.1:4173` (`listen EPERM`). `npm run test:e2e` now rebuilds current source before starting an isolated preview server and covers People add/import/membership/dirty-navigation/PWA paths, but it could not run in this environment.

## Status

**Phase 1 PWA migration complete locally** — `apps/admin` provides an installable static fictional-data prototype with in-memory People flows and a conservative offline explanation. Format, lint, Svelte diagnostics, domain tests, and production build pass; browser smoke verification remains blocked by sandbox port binding.
