# Sunday attendance and reporting

[← Back to the Product Storybook](../product-storybook.md)

## Purpose

Record Sunday participation consistently, calculate trustworthy totals, and give the administrator useful growth reports for discussion with pastors and leaders.

## Sunday check-in story

```mermaid
flowchart LR
    directory["Shared people directory"] --> service["Select Sunday service"]
    service --> find["Find person by name"]
    find --> checkin["Mark present"]
    checkin --> total["Update recorded attendance"]
```

- Sunday services come first, including multiple services on the same Sunday.
- Other days can be added later through configuration.
- Staff find each person and mark them present.
- The system calculates the service total from distinct active check-ins.
- There is no separate manual headcount in V1.
- A person can attend more than one service, but daily unique-person totals count them once.
- Importing a person does not check them in.
- A repeated check-in does not count twice.

## What the attendance total means

The total covers checked-in registered people who:

- Met the configured minimum-age rule when they registered, or retained eligibility after a later increase.
- Have access to a valid phone number.

It is labelled **recorded attendance**. It does not claim to count everyone physically present.

## Service corrections and fallback

Authorized staff can correct mistakes, with a record of who made the correction and when. An open or unfinished service is different from a completed service with zero attendance.

The church still needs to confirm the service-day devices, available connectivity, and the manual fallback when the application cannot be reached.

## Administrator reporting desk

The church administrator operates the reports and discusses the findings with pastors and leaders.

### 30-day visitor return

A visitor counts as returned when they have another recorded visit on a different calendar date within 30 days of their first recorded visit.

- A second service on the first date does not count as a return.
- Final rates include only people with a complete 30-day observation window.

### 90-day visitor-to-member conversion

A visitor counts as converted when an administrator records membership recognition within 90 days of the first recorded visit.

- Attendance frequency alone does not count as conversion.
- Final rates include only people with a complete 90-day observation window.

### Longer-term attendance retention

V1 also compares a baseline attendee group with attendance in a later period. This is a separate measure from visitor return and membership conversion.

The administrator should see:

- Baseline period and comparison period.
- Number of people in the baseline group.
- Number and percentage who attended in the later period.
- Data coverage and incomplete service records.

The comparison periods still need agreement.

## Report boundaries

- Reports state the population and time window they measure.
- A zero denominator displays “Not enough data,” not 0%.
- Corrected historical check-ins may change a regenerated report.
- Exports show generation time and follow the same access rules as the report.
- Exact dates of birth never appear in reports or exports.
- Attendance, membership, and spiritual growth remain different concepts.

## Open decisions

- The baseline and comparison periods for longer-term retention.
- Exact Sunday service schedule at pilot launch.
- Devices, connectivity, and manual fallback.
- Whether pastors and leaders need their own application logins or receive reports through the administrator.

See the complete rules in [requirements.md](../requirements.md#75-reports-and-growth).
