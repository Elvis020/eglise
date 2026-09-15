# Church Administration Platform — Requirements and Delivery Plan

**Status:** Working draft; initial release direction confirmed, detailed workflows still under review.
**Prepared:** 15 September 2026.
**Source:** [voice_notes.md](voice_notes.md), preserved unchanged.
**Working project name:** Eglise; final product and church names require confirmation.

## 1. Purpose and intended outcome

Build a shared system that helps church leaders maintain accurate records, understand attendance and growth, and take responsibility for the people in their care. Replace disconnected administrative spreadsheets gradually, while retaining working communication channels until a replacement has clear value.

The church wants infrastructure to support growth toward approximately 2,000 people and a possible expansion from two to four Sunday services. These are planning inputs from the discussion, not confirmed current membership counts or launch targets.

Success means:

- Administrators can find a person and their relevant records without reconciling several spreadsheets.
- Attendance teams can record participation reliably across multiple services.
- Leaders can distinguish visitors, returning visitors, and recognized members.
- Pastors can see who is responsible for a person and identify gaps in follow-up.
- Authorized staff can produce consistent monthly reports.
- Financial and personal information is visible only to people who need it.

The application can measure participation and membership progression. It cannot, by itself, establish spiritual growth or guarantee church growth.

## 2. How to read this document

- **Source requirement:** Expressed in the recording; still subject to stakeholder validation because the wider stakeholder meeting had not happened.
- **Proposal:** An engineering or product recommendation added to make delivery practical.
- **Open decision:** An unanswered question that could change behavior, scope, cost, or schedule.

The numbered requirements below describe proposed system behavior. Only the decisions explicitly confirmed below are agreed; detailed acceptance criteria and other release placements remain subject to review.

### Decisions from the initial review

- **Confirmed:** The first launch is a pilot for one church.
- **Confirmed:** V1 starts with the admin foundation; discipleship and Word Digest are V2.
- **Confirmed:** The current phase is product discovery, not implementation. First build a shared picture through the concise [Product Storybook](product-storybook.md) and its linked chapters in `docs/`; refine the requirements and existing Todo items from that discussion.
- **Confirmed:** V1 starts with a basic name-and-phone person model, and phone number is required. Staff can add a person manually or import people from a spreadsheet; the existing spreadsheet structure has not yet been inspected. Ghana is the default country context, but valid international numbers are supported.
- **Confirmed:** The V1 directory and attendance scope starts at age 16 and covers registered people who own or share access to a valid phone number. The minimum age is an administrator-controlled setting that can change over time. Date of birth is stored privately to apply the age rule but is not displayed. Two people may share the same phone number, so phone is required contact information but never a unique person identifier. People below the configured age and people without phone access are outside V1 attendance scope.
- **Confirmed:** Raising the minimum age affects new registrations only. Anyone already registered under an earlier valid threshold keeps future check-in eligibility. Lowering the age permits newly eligible registrations. Age-setting changes never delete people or rewrite historical attendance.
- **Confirmed:** The church administrator is the primary user of attendance and growth reports and discusses the results with pastors and leaders. V1 includes the 30-day visitor-return report, 90-day membership-conversion report, and a longer-term attendance-retention report. The long-term comparison period still needs to be chosen.
- **Confirmed:** The administrator will perform most detailed work on a desktop or laptop. Imports, reconciliation, reports, configuration, batch actions, and finance workflows should use desktop space effectively. Attendance check-in must remain responsive and efficient on phones and tablets over ordinary 3G connections. The same web application serves both contexts.
- **Confirmed:** The pilot's planned recurring infrastructure budget is zero. The church expects to pay only for its domain and will use Cloudflare's free allowances rather than a paid Supabase or Cloudflare plan. Architecture and query design must remain within documented free limits, expose usage trends, and define what happens before a limit is reached.
- **Confirmed:** Staff find each person by name and check them into a service. The system generates the headcount from distinct check-ins; there is no separate manual headcount entry in V1.
- **Confirmed:** Launch attendance covers Sunday services, with the ability to add other days later. Keep dated service sessions flexible so adding days does not require replacing attendance records or redesigning the workflow.
- **Confirmed:** Administrators handle membership paperwork and can mark an Assimilation cohort as members in one reviewed batch. No separate pastor approval step is needed in the application. V1 uses a selected group of people based on the paperwork; V2 connects that action to Word Digest cohort records.
- **Confirmed:** V1 includes tithe recordkeeping and welfare covering both member contributions and assistance given to members. Detailed transaction fields, permissions, and approval rules remain open. Separate welfare case management is outside the current scope.
- **Confirmed:** Preserve each person's tithe and welfare records, including contributions and assistance. Pastors see summary totals only for now; individual financial records are not exposed through their access. Authorized finance/welfare staff retain the detailed records, with their exact permissions still to be agreed.
- **Confirmed:** Keep the existing WhatsApp and Telegram communication processes for now. V1 does not send bulk messages directly or integrate with those channels. Reassess in-app messaging later using pilot feedback; a simple resource-links section remains a separate proposal.
- **Unconfirmed:** Launch date, budget, staffing, and the detailed membership and reporting rules.
- **Provided:** [GitHub repository](https://github.com/Elvis020/eglise) and [GitHub Project](https://github.com/users/Elvis020/projects/8/views/1) for implementation and task tracking.

## 3. What the discussion establishes

| Topic | Source requirement or context | What remains unsettled |
| --- | --- | --- |
| First users | Department leaders and designated staff enter data initially. | Exact roles, approval rights, and number of users. |
| Delivery priority | Start with administration including finance; discipleship and Word Digest follow in V2. | Detailed workflows and release acceptance. |
| People | Maintain a database distinguishing members from visitors; require name and an international-capable phone number, with manual addition and spreadsheet import. Start at age 16, allow shared numbers, and let administrators adjust the minimum age later. | Actual spreadsheet structure, treatment of existing members, and how age eligibility is verified. |
| Attendance | Individual staff-operated check-in, with headcounts calculated by the system. | Actual devices, service workflow, and connectivity fallback. |
| Services | Start with Sunday services, with other days possible later. The notes describe two Sunday services and possible growth to four. | Exact launch service schedule and, for V2, how Word Digest relates to each service. |
| Growth | Understand whether visitors return and become members. | Definitions and measurement windows. |
| Membership | Administrators handle the paperwork and can mark a whole Assimilation cohort as members together; no separate pastor approval step in the application. | Exact recognition date, certificate recording, and treatment of existing members. |
| Discipleship | Track disciplers, their disciplees, pastoral responsibility, and progress. | Assignment rules, report format, and visibility of care notes. |
| Word Digest | Track five classes, attendance, exams, and progression. | Confirmed sequence, exam rules, and cycle duration. |
| Finance | V1 tithe recordkeeping plus welfare contributions and assistance given to members. | Transaction fields, permissions, approvals, and reconciliation rules. |
| Messaging | Keep existing WhatsApp and Telegram processes for V1; direct in-app messaging is deferred. | Whether a later integration offers enough value, and its audience, cost, and channel. |
| Church Notes | Telegram already hosts notes and sermons. Links were suggested; member access was also discussed. | Public versus authenticated access and whether links alone meet the need. |
| Timing | An admin release “before month end” was discussed. | The recording's date, a firm deadline, and available capacity. |

## 4. Product boundaries and ownership

Organize the product by responsibility, with shared person records connecting the modules:

```text
Church administration platform
├── People and membership: identity, visitor status, membership recognition
├── Attendance: service sessions, check-ins, calculated attendance totals
├── Discipleship: care assignments, follow-up, progress reports
├── Word Digest: class enrollment, attendance, results, progression
├── Finance and welfare: contributions, assistance, restricted records
└── Communication and resources: announcements, sermon and notes links

Shared capabilities: access control, imports, reporting, audit history, backups
```

**Boundary decisions:** Word Digest owns class completion; the people module owns membership recognition. Service attendance and class attendance are distinct records. Reports read these records rather than maintaining competing totals. A discipler, facilitator, donor, and member may all be the same person.

## 5. Users and access model

**Proposal:** Staff accounts first, with permissions attached to roles and assigned responsibilities. One account may hold several roles. A person's church profile does not automatically give them an account.

| Role | Typical responsibility | Proposed access boundary |
| --- | --- | --- |
| System administrator | Manage accounts, roles, and system settings. | Administrative access must not automatically expose confidential finance or care notes. |
| Church administrator | Maintain people, imports, service schedules, operational reports, and cohort membership recognition, primarily from a desktop or laptop. | Primary operator for attendance and growth reports and presents/discusses them with pastors and leaders. Can mark an eligible cohort as members after handling its paperwork; finance requires a separate permission. |
| Attendance officer | Find people and record attendance. | Minimum profile details needed for check-in; no tithe or care details. |
| Pastor / ministry leader | Participate in review of ministry progress, care coverage, attendance/growth reports, and financial summary totals. | Admin prepares the V1 attendance/growth reports for leadership discussion. Financial information remains summary-only: no individual tithe, welfare contribution, or assistance details. Other ministry access follows the approved scope. |
| Discipleship coordinator | Assign disciplers and review follow-up coverage. | Discipleship records in their responsibility. |
| Discipler | Follow up and report on assigned people. | Their assigned disciplees; no general financial access. |
| Word Digest coordinator / facilitator | Manage classes, attendance, results, and progression. | Assigned classes; coordinator may approve progression. |
| Finance / welfare officer | Record and reconcile permitted financial or welfare activity. | Restricted records for the relevant function. |
| Member / visitor | Possible later self-service user. | No V1 account by default; later access limited to their own information and published content. |

The church must approve the remaining permission matrix before live data is loaded. Pastor financial access is already decided: summary totals only. Person-level tithe and welfare data remains stored for authorized finance/welfare use and is not available through pastor-facing screens, person profiles, drill-downs, server requests, or exports.

## 6. Proposed release plan

Prefer small usable releases over implementing every module before anyone can use the system. Version numbers represent scope boundaries, not promised dates.

| Release | Outcome | Proposed scope | Exit condition |
| --- | --- | --- | --- |
| Discovery / V0 | Agree on workflows and prepare data. | Validate this document, inspect sample spreadsheets, define permissions and reports, prototype registration and check-in. | Named church decision-maker approves V1 scope and pilot workflow. |
| V1 — Admin foundation | Staff can manage people, Sunday attendance, and financial records reliably. | Staff access, people and membership records, spreadsheet import, multiple service sessions, attendance, basic growth and monthly reports, tithes, welfare contributions and assistance, audit and recovery capabilities. | A real service pilot, report reconciliation, and restricted financial workflow checks pass with church staff. |
| V1.1 — Administrative expansion | Extend administration after the first pilot. | Curated resource links where useful. Direct messaging is deferred for later reassessment, without a committed release. | Resource scope and audience are agreed. |
| V2 — Discipleship and learning | Leaders can track care and the Word Digest journey. | Assignments, progress reports, classes, enrollment, class attendance, results, progression, and membership handoff. | Coordinators complete realistic care and class-cycle scenarios. |
| V3 / later — Member access | Members participate directly where it improves the workflow. | Possible member portal, self-service details, QR check-in, personalized resources, and approved integrations. | Pilot evidence demonstrates demand and staff can support the new workflow. |

**Release direction:** The user confirmed the admin-first V1 and discipleship/Word Digest V2 split. V1 finance includes tithes, member welfare contributions, and assistance given to members. Agree transaction details and controls before estimating finance delivery. V1.1 communication/resource scope and later member-facing features remain proposals.

### V1 exclusions under this proposal

- Member accounts, member-operated registration, and self-service QR check-in.
- Direct in-app bulk messaging, WhatsApp/Telegram integrations, SMS/email sending, chat, and automated follow-up campaigns; existing channels continue independently.
- Full Word Digest and discipleship workflows beyond recording existing membership evidence.
- Online payments, accounting/payroll, and financial integrations.
- Native mobile apps, offline synchronization, and multi-branch administration unless discovery makes them essential.
- Hosting sermon audio, generating sermon notes, or replacing Telegram.

## 7. V1 functional requirements

### 7.1 Staff access and configuration

- **ACC-01:** Invite or create approved staff accounts, sign in, recover access, assign roles, and deactivate access without losing authored records.
- **ACC-02:** Enforce permissions on the server, including reports and exports. Hiding a screen is insufficient.
- **CFG-01:** Configure the church's display name, reporting timezone, Sunday service schedule, and minimum registration age. The minimum age starts at 16 and can be changed by an authorized administrator. Support multiple Sunday services without hardcoding a limit of two. Keep service dates and schedules flexible enough to add other days later through configuration; additional days are not part of initial pilot operation.
- **CFG-02:** Keep completed service sessions historically stable when future schedules change.
- **CFG-03:** Preserve the effective date and history of minimum-age changes so historical attendance remains interpretable. Raising the current minimum applies to new registrations only; people validly registered under an earlier threshold keep check-in eligibility. Lowering it allows newly eligible people to register. Changing the setting must not delete people or rewrite earlier check-ins.

**Acceptance:** An attendance officer can check someone in but cannot retrieve restricted financial records or change roles, including by direct request. A deactivated account loses active access.

### 7.2 People and membership

- **PEO-01:** Start the person entry and import model with required name and phone number. Staff can add someone manually or import people from a spreadsheet. Maintain a stable internal identifier; membership standing, record status, and visit history support the wider workflows without requiring an expanded registration form at launch.
- **PEO-02:** Require a valid phone number for every pilot person. Default manual entry to Ghana (`+233`) while allowing staff to select another country or enter a valid international number. Store numbers in a normalized international form so Ghanaian local formats and numbers from other countries remain comparable. Phone is required contact data, not the person's database identity: duplicate names and shared phone numbers are allowed and must not automatically merge two people.
- **PEO-03:** Search by name and available contact details; show enough distinguishing information for staff to select the right person. When a phone number is shared, show the matching people separately.
- **PEO-04:** Separate membership standing from record status. For example, a member may later become inactive without erasing their membership history. Define inactive, transferred, and other statuses with stakeholders.
- **PEO-05:** Allow an authorized administrator to mark an entire Assimilation cohort as members through a reviewed batch action after handling the paperwork, without a separate pastor approval step. Record recognition date, basis, and responsible administrator for each person. V1 supports selecting the relevant people from the directory, with a cohort/batch reference where useful; it does not require the V2 class system. V2 connects the selection to the actual Word Digest cohort. Proposed review behavior: preview the selected people and allow exceptions to be excluded before confirming the batch.
- **PEO-06:** Preserve membership history. Attendance count alone must not make a person a member. Migrated members with incomplete historical evidence require a documented legacy classification, not invented class results.
- **PEO-07:** Flag possible duplicates for review. A shared phone number alone is not a duplicate. Any merge must preserve linked attendance and other records and record who approved it.
- **PEO-08:** Set the initial minimum registration age to 16. An authorized administrator can adjust it later. A new person must meet the minimum in effect and have access to a valid phone number. Once validly registered, they retain check-in eligibility if the minimum is later raised. People who were never eligible or lack phone access are not represented in V1 attendance totals.
- **PEO-09:** Require date of birth for registration and import so the system can evaluate the configurable age rule. Treat the exact date as hidden sensitive data: authorized administrators may enter or correct it, but after saving it is not displayed in profiles, directory/search results, check-in screens, reports, exports, audit descriptions, or logs. Application responses should expose eligibility or age-band information only where needed, not the stored date. Correcting it must be audited without recording the date value in the audit message.

**Acceptance:** A returning visitor reuses their existing profile. Two people can register with the same valid phone number and remain distinct, searchable records. An authorized administrator can select and mark a whole cohort as members, with the responsible administrator and recognition date recorded per person, without rewriting earlier visits as member attendance. A repeated batch does not duplicate recognition history or change an existing member's original recognition date. Two people with the same name remain separate unless a reviewed merge is approved.

### 7.3 Spreadsheet migration

- **IMP-01:** Support importing people with required name, phone number, and date of birth. The source spreadsheet structure is unknown; define the initial destination model now and validate column mapping against a sample before implementation. The import must accept Ghanaian and international phone formats, normalize valid numbers using the correct country context, allow the same number on multiple people, and flag missing or invalid phone/date-of-birth values for correction before those rows can be imported. Use date of birth only to evaluate eligibility and protect it under PEO-09. Historical attendance and financial imports require separate mapping and approval. Importing a person does not itself create a visit or check-in.
- **IMP-02:** Preview mapped fields, invalid rows, and possible duplicates before committing an import. Show actionable row-level errors.
- **IMP-03:** Identify the source file/batch and importing staff member. Re-importing a batch must not silently create duplicate people.
- **IMP-04:** Reconcile imported, rejected, and skipped counts against the source. Explain how an incorrect batch will be corrected before using the process on live records.

**Acceptance:** A representative sample containing missing phone numbers, Ghanaian and international formats, repeated names, shared phone numbers, missing/invalid dates of birth, and boundary ages produces a reviewable preview and reconciled result without silent data loss. Rows without a valid phone number or date of birth are not imported until corrected. The preview communicates eligibility without unnecessarily exposing full dates of birth.

### 7.4 Service attendance

- **ATT-01:** Create dated Sunday service sessions with service type, start time, and responsible team for launch. Use the same session and check-in model when additional days are introduced later.
- **ATT-02:** Let authorized staff search for and check in an existing person, or register a newcomer during check-in.
- **ATT-03:** Permit at most one active attendance record per person per service session, including when two staff members check them in simultaneously.
- **ATT-04:** Allow the same person to attend different services on the same day. Daily unique-person totals must count them once; service participation totals may count each service.
- **ATT-05:** Generate each session's headcount from its distinct active person check-ins. Do not provide a separate manual headcount entry in V1. Corrections must update the calculated total. Label the number as recorded attendance; someone who was present but never checked in is not included.
- **ATT-06:** Allow authorized correction of mistakes with an audit trail. Distinguish an open/unsubmitted session from a completed session with zero attendance.
- **ATT-07:** Define a manual fallback for poor connectivity and a controlled process for entering delayed records. Offline synchronization is a separate feature.

**Acceptance:** Two concurrent check-ins of the same person in one service yield one attendance record and a headcount of one. Their attendance at a second service increases service participation but not the day's unique-person count. Removing a mistaken check-in updates the affected totals. Importing people alone does not increase attendance.

### 7.5 Reports and growth

- **REP-01:** Provide service, date-range, and monthly summaries with clearly labeled totals and filters.
- **REP-02:** Show active recognized members, attendance totals calculated from check-ins, first recorded visitors, returning visitors, and newly recognized members separately. Distinguish per-service participation from unique people across services; a headcount is the calculated service total, not another population to add. Label attendance reports as covering registered people who met the age rule when registered and satisfy the phone requirement, rather than everyone physically present. Display or retain the age rule applicable to each registration/reporting period when it has changed over time.
- **REP-03:** Report a visitor as returned when they have a later recorded visit on a different calendar date within 30 days of their first recorded visit. A second service on the same date does not count as a return. Report a visitor as converted when they are recognized as a member within 90 days of their first recorded visit. Attendance frequency alone does not count as conversion. Display data coverage and incomplete observation windows.
- **REP-04:** Export approved report fields to CSV for administrative use. Apply the same permissions to exports as to the underlying records. Never include date of birth; use an approved derived eligibility or age-band field only when a report genuinely needs it.
- **REP-05:** Let authorized staff trace summary figures to supporting records. Corrected historical records may change a regenerated report; export time must be visible.
- **REP-06:** Provide an administrator-facing longer-term attendance-retention report comparing a defined baseline attendee cohort with its attendance in a later period. Show the baseline period, comparison period, numerator, denominator, and data coverage. The administrator uses the result in discussions with pastors and leaders. Confirm the two periods before implementation; do not combine this measure with the 30-day visitor-return or 90-day membership-conversion rates.

**Acceptance:** Staff can reproduce a monthly report from an agreed test dataset, including a person attending two services, a duplicate check-in attempt, incomplete sessions, and visitors who have not yet had enough time to return.

## 8. Finance, communication, and resources

### 8.1 V1 — Tithes, welfare contributions, and assistance

- **FIN-01:** Record tithe transactions with amount, currency, received date, contributor where known, payment method/reference where applicable, and recording staff member.
- **FIN-02:** Record both member welfare contributions and assistance given to members as distinct activities. Link each to the relevant person where applicable and report contributions received and assistance provided separately. Agree amount/value fields, whether assistance can be non-cash, dates, references, and approval rules before implementation. Separate welfare case management is outside the current scope.
- **FIN-03:** Report totals by period and permitted category/person. Pastor-facing reports show aggregate tithe totals, welfare contributions received, and assistance given, without person-level breakdowns or links to individual transactions. Define how anonymous contributions and opening balances are treated.
- **FIN-04:** Correct financial entries through a traceable adjustment or reversal process; do not silently overwrite or hard-delete the history.
- **FIN-05:** Preserve individual tithe and welfare records for authorized finance/welfare staff. Give pastors summary totals only, with no person-level financial details through profiles, reports, drill-downs, server requests, or exports. Apply the same boundary to assistance recipients and contribution records. Define the remaining finance roles, reconciliation responsibility, and approval rules for corrections or disbursements.
- **FIN-06:** Treat this module as recordkeeping unless online payment collection is separately approved. Use exact monetary values and do not aggregate different currencies into one unlabeled total.

**Acceptance:** Authorized finance staff can reconcile an agreed spreadsheet period against imported and entered records, including a reversal. A pastor can see summary totals but cannot retrieve any person's tithe, welfare contribution, or assistance details through the interface, a direct server request, or an export. Restricting pastor access does not delete or anonymize the underlying person-level finance records.

### 8.2 Communication decision and proposed resource links

- **COM-01:** Retain the church's existing WhatsApp and Telegram workflows for V1. Do not add direct bulk sending, channel integration, or recipient-list preparation as a V1 communication feature. Revisit messaging only after a later scope discussion.
- **COM-02:** If integrated sending is approved in a later release, require recipient preview, authorized sender confirmation, recorded delivery status, and safeguards against duplicate sends. Agree communication preferences and channel costs first. These are conditional future requirements, not V1 acceptance criteria.
- **RES-01:** Allow authorized staff to maintain labeled links to Church Notes, sermon audio, and existing social channels, optionally grouped by service date.
- **RES-02:** Decide who consumes these links. A staff-only application does not solve member access; a public resource page or later member portal is a separate scope decision.

Built-in chat, discussion threads, sermon transcription, and AI-generated notes are later ideas, not approved requirements.

## 9. V2 functional requirements — discipleship and Word Digest

### 9.1 Discipleship and pastoral responsibility

- **DIS-01:** Designate disciplers and assign disciplees using existing person records. Confirm terminology: the transcript uses “disciple” for more than one role.
- **DIS-02:** Record assignment start/end dates and responsible pastor or coordinator. Preserve transfers and historical responsibility.
- **DIS-03:** Show each discipler's assigned people, workload, and people without an active assignment.
- **DIS-04:** Capture follow-up date, contact outcome, next action, and next follow-up date. Agree the minimum progress report fields before adding free-form sensitive notes.
- **DIS-05:** Provide overdue follow-up and progress summaries for authorized leaders. Rules such as one active primary discipler per person require stakeholder approval.

**Acceptance:** A coordinator can assign and transfer a person while retaining history. Each discipler sees only the approved scope. A pastor can identify unassigned people and overdue follow-up without inferring that missing reports prove lack of care.

### 9.2 Word Digest

The provisional class sequence from the recording is:

**Experience → Assimilation → Assurances → Doctrine → Growth**

- **WD-01:** Configure stages, class groups, facilitators, and cohorts/cycles. Confirm class names and sequence before using them as progression rules.
- **WD-02:** Enroll a person in a class with effective dates. Distinguish enrollment totals from actual class attendance.
- **WD-03:** Record attendance for dated class sessions separately from service attendance.
- **WD-04:** Record assessment results and completion decisions. Agree pass thresholds, absence handling, repeats, exemptions, and who approves progression.
- **WD-05:** Promote eligible learners through an explicit reviewed action and preserve enrollment history. Do not automatically move everybody just because a cycle ends.
- **WD-06:** Report enrollment and participation by class, cohort, and period, including historical enrollment at a chosen date.
- **WD-07:** After Assimilation and membership paperwork are confirmed, allow an authorized administrator to review the cohort and mark its eligible people as members together. Reuse the V1 membership batch workflow with linked class records; no separate pastor approval step is required in the application. Record certificate reference/issue date if needed; automated certificate generation is optional scope.
- **WD-08:** Record baptism status/date where needed without assuming that everyone completing Experience needs baptism or that baptism is a membership prerequisite.
- **WD-09:** Record completion of Growth. Becoming a facilitator requires the church's appointment process; do not grant staff access automatically.

The recording suggests exams approximately every two months but does not confirm the interval. Curriculum hosting, online examinations, and lesson authoring are not implied by recording class results.

**Acceptance:** A coordinator can run a sample cohort through enrollment, class attendance, results, a repeat, and promotion. A membership handoff occurs only under the approved Assimilation rule, with traceable history.

## 10. Reporting definitions to approve

Different questions require different measures. Avoid a single ambiguous “retention” percentage.

| Measure | Proposed definition | Decision or limitation |
| --- | --- | --- |
| Registered people | Distinct person profiles, with archived/merged records treated explicitly. | Not the same as members or attendees. |
| Recognized members | People with approved membership standing as of the reporting date. | Define whether the headline figure excludes inactive members. |
| Service attendance / headcount | Distinct registered people with retained check-in eligibility and an active check-in to one service session. | Minimum age starts at 16 and may change; previously valid registrants remain eligible after an increase. Calculated by the system; no manual headcount field. Ineligible people and anyone not checked in are not included. |
| Unique attendees | Distinct identified people across selected sessions/dates. | Requires person-level attendance. |
| First recorded visitors | Non-members whose first known visit falls in the selected period. | Imported history may be incomplete; “first recorded” is not always first ever. |
| Returning visitors | Non-members attending in the period with an earlier known visit. | Use standing at the attendance date for historical reports. |
| Visitor return rate | Percentage of a first-visit cohort with a later recorded visit on a different calendar date within 30 days. | A second service on the same date does not count as a return. Include only first visits old enough to have a complete 30-day window in the final rate. |
| Visitor-to-member conversion | Percentage of a first-visit cohort recognized as members within 90 days of the first recorded visit. | Recognition uses the administrator-controlled membership process; attendance alone is insufficient. Include only first visits old enough to have a complete 90-day window in the final rate. |
| Ongoing attendance retention | Percentage of a baseline attendee cohort also attending in a defined later period. | Included in V1 for administrator-led leadership review. Define the baseline and comparison periods before implementation. Keep it separate from visitor return and membership conversion. |

For the 30-day return rate and 90-day membership-conversion rate, include only people whose full observation window has elapsed in the final rate denominator, or label a separate preliminary rate clearly. Display numerator, denominator, window, and incomplete records. A zero denominator displays “Not enough data,” not 0%.

## 11. Shared quality and operational requirements

These are proposed engineering requirements; targets and ownership must be agreed before implementation.

- **Usability:** Use a responsive web application with two deliberate working contexts. Design data-dense administrator workflows primarily for desktop and laptop screens, including efficient tables, filters, batch actions, imports, reports, and keyboard navigation. Design service-day check-in for quick phone and tablet use as well as desktop. Do not reduce the desktop administration experience to a stretched mobile layout. Keep forms readable, validation clear, controls accessible, and contrast adequate across supported sizes.
- **Reliability:** Retries and concurrent submissions must not create duplicate check-ins or transactions. Failed saves must be visible and recoverable.
- **Performance:** Test administrator workflows on representative desktop hardware and test search and check-in on representative phones over ordinary Ghanaian 3G conditions. Use the agreed launch dataset and concurrent staff count, allowing for the approximate 2,000-person growth ambition. Set measurable response-time and transfer-size targets after confirming devices and connectivity.
- **Security:** Use authenticated access, server-side permissions, protected network transport, secure session handling, and prompt access revocation. Do not put secrets or sensitive personal content in application logs. Protect stored dates of birth as hidden sensitive data and do not return the exact value through ordinary read endpoints.
- **Data minimization:** Collect date of birth only to apply the adjustable age rule. Do not display or export the exact date after entry. Confirm retention, deletion/archive, and communication rules before importing live data.
- **Auditability:** Record actor, time, and relevant change details for role changes, imports, merges, attendance corrections, membership recognition, financial adjustments, and class progression. Restrict access to the audit trail itself.
- **Recovery:** Propose automated daily backups and a tested restore before launch. Agree acceptable data loss and recovery time; daily backups may be insufficient for high-volume Sunday entry.
- **Operations:** Name a system owner, church data owner, support contact, and report approver. Monitor availability, errors, and backup failures without exposing sensitive records.
- **Data ownership:** The church must be able to retrieve its records in an agreed export format. Establish who can request a full export and how it is protected.

## 12. Technical direction — working proposal

Start with a responsive, installable web application and one maintainable backend, organized into the functional areas above. Provide a desktop-oriented administration workspace and a compact service-day check-in experience from the same application. A relational database fits the linked people, attendance, classes, assignments, and transaction histories.

The working proposal is SvelteKit with TypeScript as a progressive web application, deployed to Cloudflare Workers with D1 for relational storage, Cloudflare Access for the outer staff sign-in boundary, and R2 for retained encrypted exports where needed. Application roles remain enforced by the server rather than relying on Access alone. This direction honors the domain-only budget but must pass a small technical proof covering Ghanaian 3G performance, role enforcement, concurrent check-in, database restore, and free-tier usage before it becomes a final stack decision.

Conceptual records:

| Area | Core records |
| --- | --- |
| Identity and access | Staff account, role, permission, responsibility scope. |
| People | Person, membership history, duplicate review/merge. |
| Attendance | Service type, dated service session, person attendance; headcounts calculated from active check-ins. |
| Discipleship | Care assignment, follow-up, progress report. |
| Word Digest | Stage, class group, cohort, enrollment, class session, attendance, assessment, completion. |
| Finance / welfare | Tithe contribution, welfare contribution, assistance record, adjustment/reversal. |
| Communication | Resource link; announcement and delivery attempt only if integrated sending is approved. |
| Shared operations | Import batch, audit event. |

Use one shared person identity across modules. Preserve effective dates where historical reporting depends on them. Enforce critical uniqueness and financial consistency in persistent storage, not just in the interface.

**Deployment boundary:** The user confirmed a single-church pilot. Multi-branch administration and a general platform sold to unrelated churches are outside the pilot. Either expansion would need a separate design decision about organizational data isolation and onboarding.

## 13. Delivery sequence and release gates

### Step 1 — Confirm workflow and scope

Meet the church administrator and relevant coordinators. Resolve the launch blockers in Section 14. Obtain representative, preferably anonymized, spreadsheet samples, current monthly reports, class registers, and permission expectations.

**Deliverable:** Approved V1 checklist, reporting glossary, permission matrix, named decision-maker, and explicit deferred scope.

### Step 2 — Prototype the first operational workflow

Walk staff through: find/register a person → select service → check in → correct a mistake → view daily totals → export a monthly summary. Test on the actual phones or computers intended for use.

**Deliverable:** Validated screen flow for the confirmed individual check-in method, including manual person entry, spreadsheet import, and calculated totals.

### Step 3 — Build the foundation and rehearse migration

Implement access, people, imports, service sessions, attendance, basic reports, and the agreed tithe/welfare workflow in dependency order. Rehearse import and reconciliation using a representative sample before loading the complete dataset.

**Deliverable:** Staging application, migration results, documented fallback, and passing critical workflow checks.

### Step 4 — Pilot a real service

Run one service with a small trained staff group and the current manual records as a comparison. Reconcile discrepancies, check usability and connectivity, and confirm responsibility for correcting data.

**Deliverable:** Pilot findings, reconciled totals, and a church-approved go/no-go decision.

### Step 5 — Launch and learn

Complete training, data reconciliation, restore verification, access review, and support handover. Expand service coverage once the pilot issues are addressed. Use operational feedback to approve V1.1 and V2 scope.

### Minimum V1 release checks

- Core registration, import, check-in, correction, and reporting scenarios pass.
- Duplicate names, required-phone validation, Ghanaian and international formats, shared phones, concurrent check-in, multiple services, and incomplete attendance sessions are handled.
- Unauthorized access is rejected on screens, server requests, and exports.
- Monthly totals and cohort calculations reconcile with agreed examples.
- Historical membership recognition is preserved correctly.
- Tithe and agreed welfare records reconcile with source records; corrections preserve history and restricted access is verified.
- A backup is restored successfully in a controlled environment.
- Staff know the Sunday fallback process and who provides support.

No calendar estimate is committed yet. An estimate needs an approved feature set, actual spreadsheet quality, available developer capacity, and a confirmed launch date. The month-end remark alone is not a usable deadline.

## 14. Clarifications and decision register

### Resolve before committing V1 scope

| ID | Question | Why it matters |
| --- | --- | --- |
| Q01 — Resolved | The user confirmed one church for the pilot. | Keep multi-branch and unrelated-church tenancy outside V1. |
| Q02 | Who approves requirements and accepts the release? Which staff will use it first? | Avoids unresolved priorities and unclear sign-off. |
| Q03 — Resolved | Admin foundation, tithes, welfare contributions, and assistance in V1; discipleship and Word Digest in V2. | Detailed workflows remain subject to discovery. |
| Q04 | What is the actual launch date, available development capacity, and budget for hosting and ongoing operations? | Makes scope and delivery commitments realistic. |
| Q05 — Partly resolved | Sunday services at launch, with other days possible later; individual check-in and automatically calculated headcounts are confirmed. Staff can add or import a person only with a name and valid phone number. Ghana is the default country context and international numbers are allowed. Administrator-heavy work is desktop-first; check-in also supports phones and tablets over 3G. Confirm exact Sunday sessions, representative devices, timing, and connectivity fallback. | Establishes the attendance story; remaining details shape the staff experience. |
| Q06 | Can we review existing people, tithe, welfare, and attendance sheets and a monthly report? How much history must migrate? | Reveals real fields, data quality, and reconciliation needs. |
| Q07 — Partly resolved | Administrators handle paperwork and can mark an Assimilation cohort as members together, without a separate pastor approval step. Confirm recognition date, certificate recording, and how existing members are recognized. | Establishes the decision-maker and batch workflow while preserving remaining recordkeeping details. |
| Q08 — Partly resolved | Welfare includes member contributions and assistance given to members. Confirm transaction details, whether assistance can be non-cash, visibility, and approvals. | Defines the remaining welfare workflow and access boundaries. |
| Q09 | What connectivity is available during services, and is a paper/manual fallback acceptable? | Determines whether offline capability is a launch requirement. |

### Resolve before the relevant module is built

| ID | Question | Why it matters |
| --- | --- | --- |
| Q10 — Partly resolved | Pastors see financial summary totals only; individual tithe and welfare records remain stored and restricted. Agree the exact finance/welfare staff permissions and separate access rules for pastoral notes. | Preserves detailed records while limiting their visibility. |
| Q11 — Partly resolved | Visitor return means a later visit on a different date within 30 days of the first recorded visit. Visitor-to-member conversion means membership recognition within 90 days. The administrator also needs a longer-term attendance-retention report for discussions with pastors and leaders; confirm its baseline and comparison periods. | Makes statistics interpretable and repeatable. |
| Q12 | Can a person have several disciplers, one primary discipler, or several pastoral assignments? What must a monthly progress report contain? | Defines assignment rules and reporting. |
| Q13 | Are the five Word Digest classes and sequence correct? What are cycle lengths, pass rules, repeat rules, and class placement exceptions? | Defines enrollment and progression. |
| Q14 — Resolved for V1 | Keep the existing WhatsApp and Telegram processes. Direct in-app sending and channel integration are deferred. | Later messaging needs and costs will be discussed only if that scope is reopened. |
| Q15 | Should Church Notes links be public, staff-only, or visible to members with accounts? Are per-sermon links sufficient? | Determines whether a member-facing interface is needed. |
| Q16 — Partly resolved | V1 minimum age starts at 16 and is adjustable by administrators; shared phone numbers are allowed. Store date of birth privately to evaluate eligibility, but never display or export the exact date. Raising the minimum affects new registrations only; existing registrants retain check-in eligibility. Confirm retention and communication rules. | Defines the pilot population while protecting the data used to apply the rule. |
| Q17 | Are there multiple currencies, anonymous gifts, historical balances, receipts, or online payment requirements? | Defines finance scope and reconciliation. |
| Q18 | Who owns hosting, support, backups, and account administration after handover? | Establishes the ongoing service model. |

## 15. Immediate way forward

1. Discuss the Product Storybook chapter by chapter: the central purpose, feature rooms, people, and their journeys. This is the current activity; development has not started.
2. Refine the stories and sketch the experience with the user before choosing implementation details.
3. Resolve the remaining workflow questions, including welfare transaction details and approvals, using representative spreadsheets and a monthly report where helpful.
4. Update this draft and the existing Todo issues to match the agreed picture, then confirm the V1 baseline, permissions, and pilot scope.
5. Agree the technical approach and delivery constraints when ready to move from discovery into implementation.

The first release centers on staff-managed people records, service attendance, reliable reporting, and the agreed tithe/welfare records. Discipleship and Word Digest follow in V2.

## 16. GitHub delivery workflow

The user requested a discuss-first implementation workflow using the repository and Project linked in Section 2.

1. Break the agreed requirements into concrete GitHub issues with an outcome, release, requirement references, acceptance criteria, dependencies, and unresolved questions.
2. Add issues to the Project as **Todo** using its actual configured status labels. Discuss scope and settle blocking questions before implementing each issue.
3. Move an issue to **In Progress** when implementation begins.
4. Implement and run the relevant acceptance and repository checks. Record the result and any remaining limitation in the issue or linked pull request.
5. Move an issue to **Done** only when its agreed completion criteria are met. Confirm whether Done requires merge or deployment before using either as the final gate.

Task tracking, implementation, and deployment are distinct states. A locally finished change must not be reported as deployed. Commit messages must explain the user-facing change, key implementation details, and verification, as requested in the project instructions.

**Access verified on 15 September 2026:** The private repository is accessible through GitHub CLI as `Elvis020`, with repository `ADMIN` permission. After the user refreshed authorization, read and write access to the private **Eglise Project** were verified by creating linked issues and setting their Project status. The configured statuses are **Todo**, **In Progress**, and **Done**.

**Delivery boundary:** Backlog creation records proposed work for discussion; it does not mean that its detailed scope has been approved or implementation has started. The local folder is not yet a Git checkout, and this requirements file has not been committed or pushed to the repository.

### Published backlog

On 15 September 2026, **23 issues** were created in the repository and linked to the Project. All 23 were read back and verified as open issues with **Todo** status and matching acceptance criteria. Dependencies are linked in each issue's **Blocked by** section. All 51 numbered requirements are referenced across the backlog.

| Group | Issues | Purpose |
| --- | --- | --- |
| Discovery | #1–#3 | Agree pilot workflows, technical approach, and finance scope. |
| V1 | #4–#15 | Staff access, people, membership, imports, attendance, reports, finance, recovery, and pilot verification. |
| Proposed V1.1 | #17 | Discuss resource-link access and usefulness. |
| V2 | #18–#22 | Agree ministry rules, then implement care assignments, follow-up, class attendance, and progression. |
| Later discovery | #16, #23 | Reassess in-app messaging and evaluate member access/QR check-in using pilot feedback. Existing WhatsApp and Telegram continue for now. |

Start discussion with:

1. [#1 — Agree pilot workflows, permissions, and reporting rules](https://github.com/Elvis020/eglise/issues/1).
2. [#2 — Validate the staff workflow and choose the technical approach](https://github.com/Elvis020/eglise/issues/2), after the pilot rules are agreed.
3. [#3 — Define V1 tithe and welfare coverage](https://github.com/Elvis020/eglise/issues/3), which can be discussed independently.

The [Project board](https://github.com/users/Elvis020/projects/8/views/1) is the current task-status source. These counts describe the verification above and will change as work proceeds.
