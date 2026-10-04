# Notes: Eglise Phase 1 planning

## Frontend prototype direction

- Build the admin shell first, with People & Membership as the only active workspace.
- Keep later modules visible as deliberate, muted “Planned next” or “In discovery” areas; do not use fabricated analytics, inactive forms, or permission-error styling.
- Use fictional records that exercise the agreed People rules: shared phones, import errors, possible duplicates, private DOB/age eligibility, and recognised membership.
- Follow `docs/ui-guidelines.md`: Avenir Next for functional UI, Iowan Old Style for display headings, the approved semantic palette, and a faint decorative church/leaves/open-hands background motif.
- Do not add backend services, authentication, persistence, real data, or deployment during this prototype pass.

## Sol implementation boundary

- Keep `index.html`, `styles.css`, and `script.js` unchanged because they are the public stakeholder site.
- Add `admin.html`, `admin.css`, `admin.js`, and a replaceable pastoral motif SVG for the separate app prototype.
- Implement People routes for directory, manual add, seeded import review, and person detail/membership recording.
- Do not parse files: the import is an explicit fictional sample review that proves the decision flow only.
- The UI must never render or search DOB after entry; the prototype discards it after deriving the in-memory eligibility result.

## SvelteKit PWA migration

- The app moves to `apps/admin` so it remains separate from the root static stakeholder site and its public sync workflow.
- Keep data strictly in memory. PWA installation must not be misrepresented as approval for offline people-record storage or production availability.
- Use an installable app shell, manifest, application icons, and a conservative offline fallback that does not surface fictional records as current church data.

## Sources

### Stakeholder meeting notes

- Local source: `voice/voice_notes_2.md`
- Key points to validate against the product documents:
  - Start with People & Membership, followed by attendance.
  - A pilot may begin with a shared account; that does not provide individual attribution.
  - Imports, shared phone numbers, a minimum-age rule, and church-recognised membership need careful handling.
  - Attendance, welfare, Bible study, Care School, resources, and the restricted clinic require later discovery or governance.

### Current product documentation

- `../docs/product-vision.md`
- `../requirements.md`
- `../docs/people-and-membership.md`
- `../docs/attendance-and-reporting.md`
- `../docs/technical-scope.md`

## Working synthesis

- The first phase should prove one reliable shared people record, rather than trying to operationalise all church work.
- Pilot safety depends on separating synthetic-data validation from approval to use real personal data.
- Attendance should begin only after the people-data workflow has demonstrated trustworthy imports, review, and membership boundaries.

## GPT-6 Sol scope challenge

- The evidence supports a People & Membership-only operational Phase 1. Although the meeting discussed the first two areas, it also says to work on the first one, review it, then move to the next tab.
- Include: manual entry, agreed-sheet import preview and controlled import, private age eligibility, shared-phone behaviour, directory, and church-recognised membership recording.
- Exclude: operational attendance and reporting, DigiReach, welfare, learning, resources, clinic work, full role-based access, named audit attribution, and all other later modules.
- Before a synthetic proof: agree the example spreadsheet, field mapping, membership evidence, owner, acceptance examples, and fallback.
- Before real data or wider release: agree privacy notice/consent, minimisation, retention, correction/deletion, ownership, role/export rules, and recovery expectations.
- The shared pilot account must visibly state that it cannot attribute changes to an individual.
- Graduation to attendance requires a separate discovery decision on event taxonomy, individual/manual count reconciliation, correction/fallback, 3G/mobile entry, and reporting definitions.
