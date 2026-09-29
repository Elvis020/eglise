# Technical scope and decision record

[← Back to the README](../README.md) · [Detailed technical approach →](technical-approach.md)

## Purpose

This is the concise record of what the stakeholder meeting confirmed, what the pilot may test, and what must remain discovery. It is not a deployment plan or a promise that the proposed stack, access model, or later modules are approved.

## Immediate scope

| Priority            | Status              | Scope                                                                                                                                   |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Start now           | Confirmed           | People and membership: manual entry, import discovery, private age eligibility, shared phone numbers, and church-recognized membership. |
| Next                | Confirmed direction | Attendance discovery across services/events, with individual attendance and manual headcounts validated together.                       |
| Explore together    | Discovery           | Reports and DigiReach follow-up; welfare; Bible study; care school; resources and announcements.                                        |
| Sensitive discovery | Restricted          | Clinic forms, history, and reporting for designated ministers only after governance decisions.                                          |

## Access decision

The temporary pilot may use a shared account. It has no individual attribution and is not an approval of shared credentials as a long-term design. Role-based access is the intended future model, but its permissions, individual identity, audit rules, retention, export authority, and recovery process are open. A sensitive workflow must not use the pilot account as though it had named accountability.

## Technical direction under evaluation

The current proposal is a responsive, installable SvelteKit application on Cloudflare Workers, with Supabase PostgreSQL/Auth, Hyperdrive, and encrypted logical backups in R2. It aims to fit the domain-only budget and remain portable through server-side modules, portable SQL, migrations, and restore testing. It is not selected until a synthetic-data proof validates real devices, 3G performance, recovery, security, and free-tier limits.

## In scope for the proof

- Desktop administration plus phone/tablet event entry.
- Person/import rules, duplicate-safe individual attendance, manual-headcount labelling, and report separation.
- An explicit shared-pilot-access limitation.
- A proposed role-based authorization proof using synthetic roles and direct-request checks.
- Encrypted export/restore, performance measurement, and provider-portability evidence.

## Not approved for implementation yet

- Individual staff provisioning, password lifecycle, or a final administrator bootstrap flow.
- A final role/permission matrix, individual audit identity, or access recertification.
- Clinic data capture, clinic reports, or clinic exports.
- Reminder and approval mechanics for welfare.
- Resource audience, member accounts, public resources, bulk messaging, direct Telegram/WhatsApp integration, hosted audio, or a member portal.
- Native apps, full offline sync, online payments, multi-church tenancy, and paid infrastructure.

## Governance blockers

Before live or sensitive rollout, agree data minimisation, notice/consent where applicable, retention, archive/deletion, corrections, roles, exports, audit access, backup/recovery objectives, and system/data ownership. For the clinic, add the designated-minister list, least-privilege design, incident handling, and access-removal process.

## Delivery rhythm

The team uses small prototypes and a Monday review with Sandra. Each review records evidence, confirms or changes the next slice, and keeps unvalidated ideas out of implementation commitments.
