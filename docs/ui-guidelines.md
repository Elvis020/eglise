# Eglise application UI guidelines

**Status:** Approved baseline for the Phase 1 frontend prototype and subsequent application work.

## Intent

Eglise should feel calm, grounded, and trustworthy without becoming beige or visually flat. Calm comes from clear hierarchy, generous breathing room, and limited simultaneous emphasis—not from removing colour.

The public stakeholder site is editorial. The application shares its warmth and considered tone, but is a practical administration workspace: it prioritises legibility, data entry, feedback, and quick scanning.

## Product constraints

- **Editorial minimalism:** Use calm hierarchy, purposeful whitespace, restrained colour, and a small number of clearly grouped actions. Minimalism must make work easier to scan; it must never hide essential context, validation, or recovery actions.
- **Inclusive device baseline:** Design for ordinary Android phones, older phones, tablets, and desktops—not only recent iPhones or high-end devices. Functional workflows must remain legible, touch-friendly, and efficient on small or lower-powered screens.
- **Unreliable-network baseline:** Assume some staff will work with slow, intermittent, or expensive connections. Keep pages and assets lightweight, avoid unnecessary remote dependencies and large media, make loading and retry states clear, and never make animation or a permanently available connection the only way to complete or understand a task.

## Foundations

### Colour tokens

Use semantic tokens rather than applying brand colours directly to arbitrary UI elements.

| Token            | Value     | Use                                                                           |
| ---------------- | --------- | ----------------------------------------------------------------------------- |
| `canvas`         | `#F7F3EA` | Main application background.                                                  |
| `surface`        | `#EEE8DA` | Quiet grouped areas and selected low-emphasis surfaces.                       |
| `surface-raised` | `#FBF9F2` | Forms, menus, dialogs, and table surfaces.                                    |
| `text-primary`   | `#24271F` | Primary text and icons.                                                       |
| `text-secondary` | `#62695A` | Supporting text and metadata.                                                 |
| `border`         | `#D7D0BF` | Dividers and default component borders.                                       |
| `primary`        | `#31543B` | Primary actions, active navigation, and key selection.                        |
| `primary-hover`  | `#203C2A` | Hover and pressed primary actions.                                            |
| `accent-warm`    | `#B86345` | Human warmth, important non-error emphasis, and carefully limited highlights. |
| `warning`        | `#C89132` | Pending decisions and caution states.                                         |
| `info`           | `#3F6275` | Informational states and neutral guidance.                                    |
| `success`        | `#5D7B49` | Confirmed and successful outcomes.                                            |
| `danger`         | `#A84535` | Errors and destructive actions.                                               |

Use `primary`, `warning`, `info`, `success`, and `danger` for meaning, not decoration. Never rely on colour alone to convey a status; pair it with a label, icon, or concise text. Keep body text on `canvas` or `surface-raised` in `text-primary` or another tested accessible colour.

### Typography

Use the existing system-first type stack so the prototype does not depend on remote font delivery:

```css
--font-ui: "Avenir Next", Avenir, "Segoe UI", sans-serif;
--font-display:
  "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
```

- **Target UI font:** Avenir Next. Use it for navigation, forms, tables, buttons, feedback, and all data-bearing surfaces. Avenir, Segoe UI, and the system sans-serif are intentional fallbacks.
- **Target display font:** Iowan Old Style. Use it only for page titles and occasional section headings. Palatino, Book Antiqua, and Georgia are intentional fallbacks.
- Do not use the display face for labels, controls, dense lists, or data tables.
- Default body size is 16px with a comfortable line height. Do not make functional UI text smaller than 14px; use 12px only for genuinely secondary, non-essential metadata.
- Use clear weight and size changes before adding extra colour or letter spacing. Avoid all-caps for paragraphs and primary actions.
- Use balanced wrapping (`text-wrap: pretty`) for ordinary reading copy. Dense controls, navigation, table cells, breadcrumbs, and compact pilot context use `text-wrap-style: auto`; keep existing single-line ellipsis patterns intact.

### Layout, shape, and motion

- Use an 8px spacing rhythm. Common gaps: 8, 16, 24, 32, and 48px.
- Use 8px radius for controls and 12px for panels/dialogs. Avoid oversized rounded cards.
- Prefer borders and restrained surface changes over heavy shadows. If a shadow is needed, keep it soft and reserved for menus and dialogs.
- Keep desktop administration dense enough to scan; keep touch targets at least 44px tall or wide on phone/tablet interfaces.
- Respect `prefers-reduced-motion`. Animation is optional feedback, never the only way to understand a state change.

### Background illustration

The application may use a temporary, very faint line illustration behind the admin shell: a church silhouette combined with leaves and open hands. It should give the product a gentle pastoral character while remaining secondary to the work surface.

- Use a single-colour vector treatment based on `primary` or `accent-warm`, at low opacity (normally 4–8%). It should remain visible at a glance without competing with text or controls.
- Place it in the shell background or a broad empty page area—not behind dense forms, tables, menus, dialogs, validation messages, or primary actions.
- It must be decorative: no essential information, no interactive behaviour, and no accessibility dependency. Hide it from assistive technology.
- Keep the artwork responsive and cropped deliberately rather than stretching it. Remove or further reduce it on narrow screens when it interferes with content.
- This is a temporary brand motif. The church’s approved emblem will replace it later; isolate the artwork behind a single token or asset reference so that swap is straightforward.

## Admin shell

The admin shell is a Phase 1 deliverable.

- The active workspace is **People & Membership**.
- Attendance, Reports, Welfare, Bible Study, Care School, Resources, and Announcements can be visible as muted future areas to demonstrate the intended information architecture.
- Group sidebar areas with quiet, non-interactive labels: Essentials; Care & formation; Communication & resources. Hide those labels in the collapsed rail without reserving their vertical space.
- A muted area is intentionally unavailable in the pilot: show its icon and name with restrained contrast, keep it non-navigable, and expose a concise assistive description such as “Not part of this pilot”. Do not add visible status copy to every row.
- Do not add fake charts, dummy completion percentages, inactive forms, or decorative dashboard metrics to future areas.
- Do not make a muted area look like an access failure. It is intentional product scope, not a permissions error.

## Component rules

### Buttons

- Use one obvious primary action per view. It uses `primary` with light text; hover and pressed states use `primary-hover`.
- Secondary actions are quiet: outlined or text buttons with a clear hover/focus treatment.
- Reusable button components own their `primary`, `secondary`, and `danger` variants through semantic tokens. A route may control a button's placement or width, but must not define a reusable button's core colour, border, or interaction states.
- Destructive actions use `danger` only when the action is genuinely destructive; require confirmation when the consequence is material.
- Label actions with verbs: “Add person”, “Review import”, “Save membership record”. Avoid vague labels such as “Submit” or “Continue” when a clearer verb exists.
- A disabled button explains why it is unavailable when that reason is not already clear nearby.

### Inputs, text areas, selects, and dropdowns

- Every field has a persistent visible label. Placeholder text is an example or hint, never the only label.
- Use 16px input text, a minimum 44px control height, visible focus rings, and high-contrast text.
- The desktop People directory filter panel is the approved dense exception: it may use 14px labels
  and controls with a 40px minimum height. At 960px and below, it returns to 16px and 44px.
  Reserve the 2px control border in both default and focus states so focus does not move adjacent
  content.
- Show help text before an error when it prevents a likely mistake; put the specific error directly beneath the affected field.
- Preserve entered values after validation errors. Never clear a form as feedback.
- Selects and custom dropdowns must support keyboard operation, Escape to close, a visible selected value, and a focus return path. Prefer native controls when they meet the interaction need.
- Date fields use the shared `EgliseDatePicker`: an editable `DD/MM/YYYY` text input paired with an app-native calendar. Its month and year headings open internal month and decade-year grids; do not use native date inputs or select controls inside this pattern. Keep local format/date validation visible, support keyboard and outside-close behaviour, return focus after a date selection, and disable dates after today unless a future-date workflow is explicitly approved.
- For sensitive fields such as date of birth, explain the purpose and surface only the minimum necessary information. Ordinary people views must not reveal DOB.

### Tables, directory lists, and search

- Optimise for scanability: stable columns, clear headings, generous row height, and a distinct hover/focus state.
- On desktop, the People directory may use approximately 8px vertical table-cell padding and a
  document-scrolling sticky table header. Do not create a nested directory scroll area for this.
- Keep the People directory practical rather than card-heavy. On narrow screens, change to a labelled stacked list instead of forcing a horizontally cramped table.
- Show empty, loading, no-results, and error states with one plain explanation and a relevant next action.
- Possible duplicates are a review state, not an automatic merge. Shared phone numbers are valid and must not be represented as errors.

### Status, badges, and validation

- Use short, plain-language labels: “Member”, “Needs review”, “Import ready”.
- A badge supplements context; it does not replace an explanation where the decision has consequences.
- Keep warning, error, success, and information treatment consistent: icon, label, concise message, then an action where appropriate.

### Toasts, banners, dialogs, and confirmations

- Use a toast for a completed, low-risk action that does not require a decision, for example “Person saved”. It must not be the only confirmation of an important outcome.
- Use an inline validation message for form errors and an in-context banner for a persistent condition, such as the shared-pilot-account limitation.
- Use a dialog only for a decision that interrupts the current task: destructive changes, import confirmation, or leaving unsaved work. Give it a specific title, consequence, and clear cancel/confirm actions.
- Do not use toasts for errors that require user action; keep those visible until resolved.

### Settings pages

- Settings are a page canvas, not a collection of oversized cards. A category starts with its own
  eyebrow, heading, and concise explanation; use spacing to separate its settings groups, adding a
  divider only when the content would otherwise be difficult to scan.
- Do not wrap a whole settings category in a panel merely to create visual grouping. Reserve raised
  surfaces for a form result, a role guide, a table empty state, or another locally grouped detail.
- Keep reference information that affects a choice visible beside that choice. Do not collapse a
  role guide, policy summary, or comparable decision aid unless the page would otherwise become
  impractical to scan.
- Make settings content wide enough for its task. Data and filters may use the normal workspace
  width; reading-only account copy should retain a readable text measure.

### Navigation and responsive behaviour

- Navigation must show the current workspace and make the active state clear without colour alone.
- In the sidebar, use a small `accent-warm` dot plus modest type weight for the active item; do not turn ordinary navigation into a card or filled row.
- At desktop widths, the sidebar is 248px expanded and 72px collapsed. At 960px and below, remove the desktop rail completely; never leave it beside a narrow workspace.
- On phone and tablet widths, the top bar identifies the church and active workspace and includes an explicit hamburger trigger. It opens a full-screen application navigation view with grouped product areas, Settings when permitted, and Log out. Do not use a fixed bottom navigation: it can cover long forms and compete with browser/PWA chrome. Keep the menu's rows at least 44px tall, preserve a visible active state, and provide a visible close action.
- Treat 960px as the responsive composition breakpoint. When the shell becomes mobile, route layouts, tables, forms, and actions must also change into their mobile composition rather than waiting for a narrower viewport.
- On phone widths, use flat, divider-led record lists and locally grouped form sections before introducing stacked card grids. Primary actions span the available width when they conclude a task; keep safe-area insets clear for sticky chrome and sheets.
- Use breadcrumbs for in-workspace navigation beyond the primary sidebar. Place one compact, single-line breadcrumb row above the page title; use the UI font at 14px, muted separators, and linked ancestor segments only. The page title is the single current-location label, so do not repeat it as a final breadcrumb segment. Do not render breadcrumbs on top-level sidebar destinations. On narrow screens, truncate earlier ancestor segments rather than wrapping the trail.
- The People workflow is desktop-friendly and must remain usable on smaller screens. Prioritise readable forms, review states, and search over trying to reproduce a full desktop table on a phone.
- Keep primary actions reachable on small screens without covering content. Do not rely on hover for essential actions.

## Accessibility baseline

- Meet WCAG AA contrast for text and interactive controls.
- All interactive elements need keyboard access and a clearly visible focus indicator.
- Use semantic HTML first; add ARIA only when native semantics do not express the interaction.
- Error, success, and pending states must be understandable with screen readers and without colour vision.
- Test the People entry and import-review paths at desktop and narrow mobile widths before calling a frontend slice complete.

## Definition of done for any in-app component

A component is not ready until it has:

1. An intentional default, hover, focus, disabled, loading, error, and success/complete state where applicable.
2. Clear copy and a semantic role appropriate to the interaction.
3. Keyboard and narrow-screen behaviour verified.
4. Token-based colour, spacing, typography, and border treatment.
5. No invented data or ambiguous placeholder interaction in stakeholder-facing views.

## Change control

Treat this document as the source of truth for in-app UI. Update it before introducing a new component pattern, colour role, type treatment, or interaction convention that would affect more than one screen.
