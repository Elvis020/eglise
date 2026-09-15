# Technical approach

[← Back to the Product Storybook](../product-storybook.md)

## Status

This is the working technical direction for the pilot. The budget, device strategy, and Supabase–Cloudflare split are confirmed; the stack must still pass a small proof before implementation issues begin.

## Confirmed constraints

- The church plans to pay only for its domain.
- Supabase and Cloudflare paid plans are outside the pilot budget.
- Supabase Free pausing and availability are accepted pilot risks.
- Eglise must be able to leave Supabase without rewriting product features.
- The administrator will do most detailed work on a desktop or laptop.
- Sunday check-in must also work well on phones and tablets over ordinary 3G.
- V1 is a staff application. Member accounts are a later decision.
- Financial data and hidden dates of birth require server-enforced access controls.

## Working stack

| Concern | Proposal | Reason |
| --- | --- | --- |
| Application | SvelteKit with TypeScript | Supports server-rendered pages, progressive enhancement, and compact interactive experiences. |
| Delivery | Installable progressive web application | One application serves desktop and mobile browsers without an app-store release. |
| Hosting | Cloudflare Workers | Places the application close to users and provides a free starting allowance. |
| Database | Supabase Free PostgreSQL | Provides a full relational PostgreSQL database and familiar migration and reporting tools. |
| Database connection | Cloudflare Hyperdrive | Pools and accelerates PostgreSQL connections from Workers without exposing database credentials to browsers. |
| Outer sign-in | Cloudflare Access | Restricts the application to approved staff using Cloudflare identity or email one-time PIN. |
| Application authorization | Server-side Eglise roles | Enforces attendance, administration, finance, welfare, and later ministry boundaries inside the product. |
| Backup storage | Cloudflare R2 | Keeps encrypted PostgreSQL dumps outside Supabase, subject to a tested restore process. |
| Backup runner | Scheduled GitHub Actions workflow | Creates, encrypts, uploads, rotates, and verifies logical database backups. |

Cloudflare Access establishes identity and blocks unapproved users before they reach Eglise. It does not replace application permissions. Eglise must still check every protected server operation and maintain its own active staff record, roles, and audit history.

## Provider portability

Supabase is an infrastructure provider, not an application boundary. Eglise should remain portable through these rules:

- All database access goes through server-side application modules. Browser code never calls Supabase directly.
- Cloudflare Access supplies staff identity; the application does not depend on Supabase Auth.
- Files and backups do not depend on Supabase Storage.
- Core workflows do not depend on Supabase Realtime, Edge Functions, generated APIs, or proprietary extensions.
- Use versioned migrations and ordinary PostgreSQL types, constraints, indexes, and transactions.
- Keep stable application-owned identifiers rather than exposing provider identifiers as product contracts.
- Run repository and workflow integration tests against a standard PostgreSQL instance.
- Produce regular logical dumps that can restore into a fresh PostgreSQL database outside Supabase.

Moving from Supabase to another PostgreSQL host should mainly involve provisioning, restoring, changing connection configuration, and verification. D1 uses SQLite, so moving from PostgreSQL to D1 would require deliberate schema and query adaptation. The same application boundary reduces that work but does not eliminate it.

## Desktop and service-day experiences

### Desktop administration

Use the additional space for:

- Searchable and filterable tables.
- Spreadsheet mapping and import previews.
- Side-by-side reconciliation and corrections.
- Batch membership review.
- Period reports and comparisons.
- Finance and welfare recordkeeping for authorized staff.
- Keyboard navigation and efficient repeated entry.

### Phone and tablet check-in

Keep the service-day path short:

1. Select or confirm the service.
2. Search by name or permitted contact information.
3. Distinguish people with similar names.
4. Mark the correct person present.
5. Show a clear saved, duplicate, queued, or failed state.

The first release should cache the application shell for fast repeat visits. Authoritative writes remain online with visible retry behavior and the agreed manual fallback. A true offline attendance outbox is a separate decision because background synchronization is not supported consistently across browsers.

## Backup and recovery

Supabase recommends that Free projects make regular logical exports and keep them off-site. A scheduled GitHub Actions workflow should:

1. Run the Supabase CLI database dump for schema, roles, and data.
2. Compress and encrypt the output before it leaves the runner.
3. Upload the encrypted archive to a private R2 bucket.
4. Retain seven daily and four weekly backups within R2's free storage allowance.
5. Record the source project, schema version, export time, checksum, and record counts without placing sensitive values in logs.
6. Restore a selected backup into disposable PostgreSQL and compare expected counts on a defined schedule.

Encryption keys must not be stored in Supabase, R2, or the backup archive. A backup is not considered successful until restoration has been tested.

## Free-tier guardrails

The pilot must remain within the current free allowances:

- Supabase: 500 MB database, 5 GB egress, and the applicable connection and compute limits.
- Cloudflare Workers: 100,000 requests per day and the free CPU limit.
- Cloudflare Access: up to 50 users.
- Cloudflare R2 Standard: 10 GB-month storage, one million Class A operations, and ten million Class B operations per month.

Use indexed searches, pagination, compact responses, aggregated reports, and no repeated polling. Monitor storage, egress, Worker requests, and backup retention. Reaching a warning threshold triggers investigation and cleanup or a provider decision; it does not silently enable a paid plan.

## Initial performance budgets

Validate these targets on representative church devices and a throttled 3G connection:

| Measure | Proposed target |
| --- | --- |
| First useful screen on a cold 3G visit | Within 5 seconds. |
| Repeat PWA visit | Within 2 seconds for the cached shell. |
| Initial compressed transfer | At most 250 KB, excluding user-requested exports. |
| Person search result | Visible within 1 second after the request reaches the application. |
| Check-in confirmation | Visible within 1 second after the request reaches the application. |

Use locally hosted or system fonts, restrained icons, route-level code splitting, and no large general-purpose component or chart library without measured justification.

## Proof required before implementation

Build a disposable technical slice using synthetic data only:

1. Protect the application with Cloudflare Access and identify an approved staff email.
2. Apply an Eglise role on the server and prove that a direct unauthorized request is rejected.
3. Search a synthetic 2,000-person directory over throttled 3G.
4. Submit concurrent check-ins and prove that the database stores only one attendance record per person and service.
5. Render one desktop import preview and one compact phone check-in screen.
6. Produce an encrypted Supabase logical dump, store it in R2, restore it into disposable PostgreSQL, and verify its record counts.
7. Run the main workflows against an ordinary PostgreSQL test instance without Supabase services.
8. Record transfer size, response time, database storage and egress, Worker requests, and backup storage.

The proof succeeds only when the security, recovery, performance, and free-allowance evidence is recorded. It does not use church data or constitute the V1 implementation.

## References

- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [Supabase CLI database dump](https://supabase.com/docs/reference/cli/supabase-db-dump)
- [Cloudflare Hyperdrive database providers](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/)
- [Cloudflare R2 pricing and free limits](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare Workers pricing and free limits](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Access plans](https://www.cloudflare.com/sase/products/access/)
- [Cloudflare Access one-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [PWA offline and background-operation limitations](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)

## Decision still needed

Confirm whether every V1 staff member can use an individual email address for Cloudflare Access. Shared sign-in accounts would weaken deactivation and audit evidence and are not recommended.
