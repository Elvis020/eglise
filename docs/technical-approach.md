# Technical approach

[← Back to the Product Storybook](../product-storybook.md)

## Status

This is the working technical proposal for the pilot. The budget and device direction are confirmed; the stack must still pass a small proof before implementation issues begin.

## Confirmed constraints

- The church plans to pay only for its domain.
- Supabase and Cloudflare paid plans are outside the pilot budget.
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
| Database | Cloudflare D1 | Relational SQLite storage with foreign keys, uniqueness constraints, and built-in recovery. |
| Outer sign-in | Cloudflare Access | Restricts the application to approved staff using Cloudflare identity or email one-time PIN. |
| Application authorization | Server-side Eglise roles | Enforces attendance, administration, finance, welfare, and later ministry boundaries inside the product. |
| Retained exports | Cloudflare R2 where needed | Keeps encrypted database exports beyond D1's free recovery window, subject to a tested restore process. |

Cloudflare Access establishes identity and blocks unapproved users before they reach Eglise. It does not replace application permissions. Eglise must still check every protected server operation and maintain its own active staff record, roles, and audit history.

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

## Free-tier guardrails

Cloudflare currently documents the D1 Workers Free allowance as:

- 5 million rows read per day.
- 100,000 rows written per day.
- 5 GB total database storage.
- Seven days of point-in-time recovery through Time Travel.

These limits are large relative to the expected one-church pilot, but the application must avoid table-wide reads and repeated polling. It should use indexed searches, pagination, compact responses, and aggregated report queries. Operations must monitor usage because reaching a daily D1 limit causes requests to fail until the allowance resets.

Longer-lived recovery requires a scheduled, encrypted export and a demonstrated restore procedure. A backup is not considered complete until restoration has been tested.

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
6. Restore a disposable D1 database using Time Travel and verify its record counts.
7. Record transfer size, response time, and D1 rows read and written.

The proof succeeds only when the security, recovery, performance, and free-allowance evidence is recorded. It does not use church data or constitute the V1 implementation.

## References

- [Cloudflare D1 pricing and free limits](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 Time Travel and backups](https://developers.cloudflare.com/d1/reference/time-travel/)
- [D1 foreign-key enforcement](https://developers.cloudflare.com/d1/sql-api/foreign-keys/)
- [Cloudflare Access one-time PIN](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)
- [PWA offline and background-operation limitations](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)

## Decision still needed

Confirm whether every V1 staff member can use an individual email address for Cloudflare Access. Shared sign-in accounts would weaken deactivation and audit evidence and are not recommended.
