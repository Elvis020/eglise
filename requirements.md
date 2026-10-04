# Eglise — requirements and decision register

**Status:** Stakeholder-meeting update. Product discovery; implementation has not started.

**Source material:** [voice notes](notes/voice/voice_notes.md) and the stakeholder meeting. The voice notes remain preserved. This document separates **Confirmed** direction from **Discovery** work and **Open** governance decisions.

## Product outcome

Eglise should help the church know people first and then shape trustworthy attendance, care, learning, resources, and reporting from real feedback. It is a one-church pilot, not a multi-tenant product or a calendar commitment.

## Discovery rhythm

- **Confirmed:** People and Membership is the immediate slice; Attendance follows.
- **Confirmed:** Sandra is the church representative for iterative feedback, reviewed on Mondays.
- **Confirmed:** Every review captures evidence and agrees the next smallest useful slice.
- **Discovery:** Detailed workflows beyond those first slices are not automatically approved by appearing in this document.

## People and membership

### Confirmed requirements

- **PEO-01:** Staff can add a person manually or import an agreed spreadsheet structure.
- **PEO-02:** Require name and a valid Ghanaian or international phone number. A phone is contact information, not a unique identifier; shared numbers are allowed.
- **PEO-03:** Hold date of birth privately only to apply the adjustable minimum registration age, initially 16. Do not show it in ordinary views, search, reports, exports, or audit descriptions.
- **PEO-04:** An age increase affects new registrations only; previously eligible people retain eligibility. Do not delete people or rewrite history because the setting changes.
- **PEO-05:** Membership is recorded only through the church's recognition and paperwork process. Attendance or learning participation does not create membership.
- **PEO-06:** An import preview shows invalid rows and possible duplicates. Shared numbers are not automatically merged, and an import never creates attendance.

### Discovery acceptance starting point

Use representative, preferably anonymised, rows to validate field mapping, Ghanaian/international numbers, shared numbers, boundary ages, missing values, duplicates, migration depth, merges, transfers, and inactive/archived states.

## Attendance and reporting

### Confirmed direction

- **ATT-01:** Attendance follows People and Membership and supports agreed services and event types, not a fixed Sunday-only model.
- **ATT-02:** Event teams need a workflow for individual attendance and a manual headcount where the church needs it.
- **ATT-03:** Individual attendance records must not duplicate the same person in the same event; participation in separate services/events remains distinguishable.
- **ATT-04:** Event/service entry works on phone/tablet as well as desktop over ordinary 3G; reconciliation and reports remain desktop-friendly.
- **ATT-05:** Attendance, membership, and spiritual growth are distinct. A report labels individual attendance, manual headcount, population, time window, and incomplete data rather than adding unlike measures together.

### Discovery requirements

- **ATT-D01:** Agree the event taxonomy, service schedule, ownership, completion state, correction path, manual fallback, and delayed-entry process.
- **ATT-D02:** Agree whether individual attendance and manual headcount coexist, how they reconcile, and which figures each report may use.
- **REP-D01:** Validate useful report definitions, including the previously proposed 30-day return, 90-day membership conversion, and longer-term retention measures; they are candidates, not final metrics.
- **REP-D02:** Discover whether DigiReach needs a follow-up list, handoff, status, reporting, or another interface.

### Acceptance starting point

For a sample event, prove duplicate-safe individual recording; add a manual headcount where agreed; correct a record; and show that the resulting report clearly separates its sources instead of double-counting them.

## Access, audit, privacy, and exports

### Confirmed direction

- **ACC-01:** The pilot may use a temporary shared account. It must not represent actions as individually attributable.
- **ACC-02:** Eventual role-based access is required. It must be enforced on screens, requests, reports, and exports.
- **ACC-03:** Sensitive clinic information is restricted to designated ministers and is separate from the school and ordinary care areas.

### Open decisions before wider or sensitive rollout

- Role/permission matrix, individual identity, audit detail, access review, recovery, and access removal.
- Privacy notice/consent, data minimisation, retention, archive/deletion, corrections, data ownership, and full-export authority/process.
- Export fields, file protection, recipients, retention, and auditability.

The shared account is unsuitable for any workflow that requires named accountability, including clinic work and sensitive welfare decisions.

## Finance and welfare

### Confirmed direction

- **FIN-01:** Keep contributions received and assistance provided as distinct activities and totals.
- **FIN-02:** Explore recurring home/mission support and emergency assistance in addition to ordinary welfare support.
- **FIN-03:** Individual finance and welfare information has a narrower audience than leadership summaries; corrections must be traceable.

### Discovery requirements

- **FIN-D01:** Define recurring-support frequency, starts/ends, pauses, beneficiaries/missions, and reconciliation.
- **FIN-D02:** Define emergency-assistance intake, urgency, evidence, recording, and follow-up.
- **FIN-D03:** Decide reminders, request/approval/payment/correction ownership, second approval, and export permissions.
- **FIN-D04:** Agree privacy, retention, reports, audit, and export boundaries before implementation.

## Bible study, discipleship, and care school

### Bible study and ordinary discipleship

- **LEARN-01:** Explore materials derived from sermons, including preparation, ownership, Telegram links, and what content belongs in Eglise.
- **LEARN-02:** Discover facilitator access and the meaning of participation: enrolment, attendance, completion, discussion, or another agreed signal.
- **LEARN-03:** Keep Bible-study participation separate from main-service attendance. Do not make membership, facilitator status, or staff access automatic from learning participation.
- **CARE-01:** General discipleship assignments, notes, responsibility, and follow-up are future discovery. Missing data is not proof that care did not happen.

### Healing and Deliverance School

- **SCHOOL-01:** Explore topics, participant progress, readiness, and booking/next-step coordination.
- **SCHOOL-02:** Define school visibility, history, and booking permissions independently from the clinic.

See [Healing and deliverance](docs/healing-and-deliverance.md) for the clinic boundary.

## Clinic restriction

- **CLINIC-01:** Clinic forms, history, and reporting are separate confidential records available only to designated ministers.
- **CLINIC-02:** Before capture, agree designated-minister access, least privilege, consent/notice, retention/deletion, corrections, exports, audit visibility, incident handling, and access removal.
- **CLINIC-03:** Never infer clinic access from administrator, leader, facilitator, school, or ordinary care status.

## Communication, resources, and announcements

- **COM-01:** Existing WhatsApp and Telegram workflows continue.
- **RES-01:** Church Notes and edited sermon audio can initially be organised as Telegram links.
- **RES-02:** Announcements are a discovery area; agree audience, owner, approval, timing, and lifecycle.
- **RES-03:** Decide whether resources are public, staff-only, authenticated-member content, or mixed; agree link review/removal, privacy, permissions, retention, exports, and reporting.

Bulk messaging, built-in chat, hosted audio, sermon transcription, AI-generated notes, direct channel integration, a public resource site, and a member portal are not approved requirements.

## Technical direction and proof

The current technical proposal is a responsive SvelteKit application on Cloudflare Workers, with Supabase PostgreSQL/Auth, Hyperdrive, and encrypted logical backups in R2. It must stay portable through server-side modules, portable SQL, migrations, application-owned domain records, and restore testing. It is a proposal, not a selected implementation.

Before live data or implementation expands, use synthetic data to prove:

1. People/import handling, private age eligibility, and shared-phone behaviour.
2. Flexible events, duplicate-safe individual attendance, manual-headcount labelling, and report separation.
3. Desktop administration plus phone/tablet entry under a representative 3G constraint.
4. The shared-account limitation and a proposed future role-based authorization test.
5. Encrypted backup/export and restoration without sensitive log content.
6. Provider-portability and free-tier usage evidence.

## Out of scope unless reopened

- Final individual staff provisioning and password lifecycle.
- Final role matrix, individual audit attribution, and clinic implementation.
- Welfare reminder/approval mechanics.
- Native apps, full offline synchronization, online payments, multi-church tenancy, paid infrastructure, bulk messaging, or a member portal.

## Delivery gate

No feature moves from discovery to implementation merely because it is documented. The Monday review with Sandra must confirm the workflow, data fields, owner, privacy/access boundary, acceptance example, and fallback where relevant. Do not report a local change as deployed, and do not use a shared pilot account to overstate accountability.
