# Phase 1 delivery plan — People & Membership pilot

## Purpose

Phase 1 establishes a dependable people record for the church. It is a bounded pilot: prove the core workflow with representative synthetic data, use the evidence to decide whether a tightly controlled real-data pilot is appropriate, then decide whether to begin attendance discovery.

This plan reflects the corrected meeting direction: People & Membership comes first; attendance follows once the foundation has been reviewed. It does not set calendar dates or select a technology stack.

## Outcome

An administrator can add a person or review an agreed spreadsheet import, keep date of birth private while applying the minimum-age rule, retain shared phone numbers without treating them as identity, and record church-recognised membership. The church has clear evidence of what works, what needs refinement, and whether it is safe to move beyond synthetic data.

## Scope boundary

### Included

- Manual person entry.
- A people directory with the agreed ordinary fields.
- An agreed spreadsheet shape, import preview, invalid-row feedback, possible-duplicate prompts, and controlled confirmation.
- Name plus a valid Ghanaian or international phone number; shared phone numbers remain valid.
- Private date of birth used only for an adjustable minimum registration age, initially 16.
- Membership recorded after the church's recognition and paperwork process.
- A clearly stated shared-pilot-account limitation: changes cannot be attributed to a named individual.

### Not included

- Operational attendance, attendance reports, or DigiReach workflows.
- Welfare, contributions, Bible study, Care School, resources, announcements, or clinic records.
- Final individual accounts, role-based permissions, named audit attribution, or a production password lifecycle.
- Native apps, offline synchronisation, payments, multi-church support, and member-facing portals.

These exclusions keep the pilot useful without presenting discovery areas as approved work.

## Delivery sequence

### Package 0 — fictional frontend prototype shell

Before operational work, provide an isolated, navigable static prototype of the People & Membership pilot. It uses only in-memory fictional fixtures, keeps the shared-account limitation visible, and labels all later modules as planned discovery. It is not connected to authentication, storage, real data, or attendance workflows.

| Package                           | Objective                                                                | Outputs                                                                                                                              | Church checkpoint                                                                                  | Completion evidence                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Agree the pilot contract       | Turn the confirmed scope into a shared, testable workflow.               | Workflow, exclusions, shared-account limitation, acceptance examples, and fallback approach.                                         | Confirm the workflow owner, acceptance examples, and fallback at the regular review.               | A reviewed decision log and an agreed next-smallest slice.                                                                                                                                                    |
| 2. Agree the people-data shape    | Establish the minimum field set and source-sheet structure.              | An anonymised representative sheet, column mapping, required-field rules, membership-evidence format, and explicit unresolved items. | Confirm the sheet, membership evidence, historical migration depth, and inactive/archive approach. | Versioned mapping and test rows for valid, invalid, shared-phone, duplicate-candidate, and boundary-age cases.                                                                                                |
| 3. Prove protected person records | Validate manual entry and age eligibility without ordinary DOB exposure. | Person entry, directory, validation feedback, private DOB handling, and the adjustable age setting.                                  | Review that the ordinary staff workflow is understandable and usable.                              | Tests show that name and valid phone are required; shared phones are accepted; DOB is absent from ordinary views, search, exports, and diagnostic/audit text; a higher age applies only to new registrations. |
| 4. Prove controlled import        | Make spreadsheet intake reviewable before people are created.            | Preview, row-level invalid feedback, possible-duplicate indicators, explicit confirmation, and an outcome summary.                   | Review representative preview outcomes and agree the staff response to problematic rows.           | A repeatable synthetic import shows no silent invalid imports, no automatic merge from a shared number, and no attendance creation.                                                                           |
| 5. Record recognised membership   | Keep membership an explicit church decision, separate from activity.     | Membership recording and the agreed evidence/reference fields.                                                                       | Confirm who can record recognition and what evidence is sufficient for the pilot.                  | Demonstrations of a person without membership, a recognised member, and a corrected membership record; no rule infers membership from an import, age, phone, attendance, or learning.                         |
| 6. Run the bounded pilot          | Evaluate the end-to-end experience and decide the next move.             | Pilot guide, known-limitations notice, issue log, recovery/fallback exercise, and recommendation.                                    | Review the evidence and decide to refine, stop, or consider a real-data pilot.                     | Manual entry → directory → membership and preview → controlled import are demonstrated with synthetic data; the shared-account limitation remains visible.                                                    |

## Test set and acceptance checks

Use only anonymised or fictional records until the real-data gate below is met. The set should include:

- Valid Ghanaian and international phone numbers.
- Two people who legitimately share a phone number.
- Missing and malformed required values.
- Possible duplicate people who require a human decision.
- A person just below and at the minimum age.
- A later age-rule increase, demonstrating that previously eligible records are not rewritten or removed.
- People with and without church-recognised membership.

The proof passes only when an import previews issues before confirmation, shared numbers do not force a merge, date of birth does not leak to ordinary staff surfaces, and an import neither records attendance nor makes someone a member.

## Decision gates

### Gate A — begin the synthetic proof

Before building beyond a disposable prototype, confirm:

- At the Monday review with Sandra, the accepted workflow, owner, representative acceptance examples, fallback, and the privacy/access boundary for the synthetic pilot.
- The sample spreadsheet and field mapping.
- The membership-recognition evidence to record.
- Which historical records, transfers, merges, and inactive/archived states are explicitly out of the first pilot.

### Gate B — allow real personal data

A successful synthetic proof is not permission to use real data. Before a real-data pilot, the church must agree and record:

- Data minimisation, notice or consent where applicable, and ownership.
- Retention, archive/deletion, and correction procedures.
- The pilot access boundary and the path to named, role-based access.
- Export authority, permitted fields, recipients, and protection.
- Backup, recovery, and the response if a record is entered or imported incorrectly.

The temporary shared account can support a limited pilot only. It must never be presented as individual accountability and must not be used for sensitive workflows.

The current technical decision register sets a broader synthetic-proof bar before **any** live data: encrypted backup/export and restoration, a proposed role-based authorisation check, portability and free-tier evidence, and synthetic attendance/device/report-separation checks. Those checks do not make attendance operational Phase 1 scope. They are a technical readiness condition under the current register. If the church wants a narrower People-only live-data gate, that register must be explicitly amended at a review before real data is loaded.

### Gate C — graduate to attendance discovery

Begin attendance discovery only after the church accepts the People & Membership evidence: controlled import and manual entry are predictable; shared-phone review is trustworthy; DOB protections hold; and membership remains a deliberate church action.

Attendance then needs its own agreement on:

- Event and service types, schedule, responsible team, completion state, and correction path.
- Individual attendance, manual headcounts, when both are used, and how they reconcile.
- Same-event duplicate prevention, delayed entry, paper/manual fallback, and reconciliation ownership.
- Phone/tablet entry over ordinary 3G alongside desktop administration.
- Report definitions that label population, time window, data source, and incomplete data without counting an individual record and a manual headcount as separate people.

No attendance operation is implied by completing this plan.

## Risks and controls

| Risk                                                                          | Control                                                                                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A shared phone number is treated as a duplicate identity.                     | Treat phone as contact information; show possible duplicates for staff review and never merge automatically because of a phone number. |
| Date of birth leaks into a normal view, search, export, or diagnostic record. | Restrict DOB to eligibility logic and run negative visibility/export checks throughout the proof.                                      |
| An import silently creates poor records.                                      | Require preview, row-level validation, explicit confirmation, and representative synthetic-sheet testing.                              |
| Membership is inferred from activity or a raw spreadsheet flag.               | Make recognition an explicit church-recorded action with agreed evidence.                                                              |
| A shared account creates a false sense of accountability.                     | State its limitation in the pilot materials and avoid sensitive workflows or claims of named audit history.                            |
| Later modules enter the pilot by implication.                                 | Keep the pilot contract visible and take every later area through its own discovery and decision gate.                                 |
| A prototype is mistaken for a technology commitment.                          | Evaluate the technical proposal against evidence; do not represent it as selected until the relevant proof is complete.                |

## Review cadence and artefacts

At each Monday review with Sandra, capture: the workflow tested, representative data used, result, issue or decision, owner, and the next smallest slice. The result should be a lightweight evidence pack—not a promise of release dates.

The current technical direction remains under evaluation. Any implementation should preserve portable data/migrations and prove backup and restoration appropriate to the chosen approach; the plan does not select the proposed stack.

## Source decisions

- [Requirements and decision register](../requirements.md)
- [Product vision and roadmap](product-vision.md)
- [People and membership](people-and-membership.md)
- [Attendance and reporting](attendance-and-reporting.md)
- [Technical scope and decision record](technical-scope.md)
