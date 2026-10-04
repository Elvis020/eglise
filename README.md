<div align="center">

# ⛪ Eglise

### Know people. Organize church life. Support growth.

Eglise is a church administration product in discovery. It starts with dependable people records and grows, with church feedback, into attendance, care, learning, resources, and other agreed work.

![Stage](https://img.shields.io/badge/stage-product_discovery-6B5B95?style=flat-square)
![Pilot](https://img.shields.io/badge/pilot-one_church-2F6F62?style=flat-square)
![Implementation](https://img.shields.io/badge/implementation-not_started-A15C38?style=flat-square)

[Read the Storybook](product-storybook.md) · [Review the Requirements](requirements.md) · [Technical Scope](docs/technical-scope.md) · [Application UI Guidelines](docs/ui-guidelines.md)

</div>

---

## What happens first

1. **People and membership:** establish the shared directory, respectful membership history, and the import path.
2. **Attendance:** validate a flexible event/service workflow with individual attendance and manual headcounts where the church needs them.
3. **Explore together:** use pilot feedback to shape welfare, Bible study, care-school work, Church Notes, sermon audio, announcements, and other resources.

This is iterative discovery, not a promised release schedule. Sandra is the church's representative for feedback, with a Monday review cadence; the team records decisions and adjusts the next slice from observed use.

## Confirmed foundation

- One-church pilot; product discovery precedes implementation.
- Name, valid Ghanaian or international phone number, and privately held date of birth support the people directory. Shared phone numbers remain valid, and the adjustable minimum age starts at 16.
- Membership is recognized through the church's process; attendance does not create membership.
- Administration is desktop-friendly; service/event work must remain practical on phones and tablets over ordinary 3G.
- Existing WhatsApp and Telegram communication continues while Eglise evaluates links, announcements, and access needs.
- The temporary pilot may use one shared account. It does **not** provide individual action attribution. Role-based access, audit attribution, retention, permissions, and export rules remain required discovery before a wider rollout.

## Product boundaries in discussion

| Area                        | Current direction                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| People and membership       | Start now; validate manual entry and spreadsheet import.                                                      |
| Attendance                  | Next; support multiple services or event types, individual records, and manual headcounts.                    |
| Reports and follow-up       | Define trustworthy measures and explore DigiReach follow-up needs.                                            |
| Welfare                     | Include recurring home/mission support and emergency assistance; reminders and approval mechanics are open.   |
| Bible study                 | Explore sermon-derived materials, facilitator access, and participation.                                      |
| Care school and clinic      | Keep school topics, progress, readiness, and booking distinct from the separately restricted clinic workflow. |
| Resources and announcements | Start with Telegram links for Church Notes and edited sermon audio; audience and access rules are open.       |

## Read the product book

1. [Product vision and roadmap](docs/product-vision.md)
2. [People and membership](docs/people-and-membership.md)
3. [Attendance and reporting](docs/attendance-and-reporting.md)
4. [Finance and welfare](docs/finance-and-welfare.md)
5. [Discipleship and Bible study](docs/discipleship-and-word-digest.md)
6. [Healing and deliverance](docs/healing-and-deliverance.md)
7. [Communication, resources, and future work](docs/communication-and-future.md)
8. [End-to-end journeys](docs/user-journeys.md)
9. [Technical scope and decisions](docs/technical-scope.md)
10. [Detailed technical approach](docs/technical-approach.md)
11. [Application UI guidelines](docs/ui-guidelines.md)

The [requirements](requirements.md) are the decision register and acceptance starting point. The original [voice notes](voice_notes.md) remain preserved source material.

## Working rhythm

```text
Discuss → prototype the smallest useful slice → try it with the church → review on Monday → decide the next slice
```

Confirmed decisions are labelled **Confirmed** in the chapters. Items labelled **Discovery** or **Open** are intentionally not implementation commitments.

## Stakeholder site publishing

The stakeholder site is available at [https://elvis020.github.io/eglise-site/](https://elvis020.github.io/eglise-site/). This private repository is canonical. GitHub Actions syncs only `index.html`, `styles.css`, and `script.js` to the public `Elvis020/eglise-site` repository when one of those files or the sync workflow changes on `main`; the workflow can also be run manually from Actions. Direct edits to those public site assets are overwritten by the next sync.
