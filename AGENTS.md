# Eglise repository guidance

## Application UI

Before creating or changing any in-app interface, read and follow [the UI guidelines](docs/ui-guidelines.md). They are the baseline for application colour, typography, responsive behaviour, accessibility, and every reusable component—including inputs, selects, dialogs, tables, empty states, and toasts.

Do not substitute generic dashboard components or introduce a competing visual language without an explicit product decision.

## Svelte and SvelteKit implementation

- Keep reusable UI in typed Svelte components under `apps/admin/src/lib/components`; keep route files responsible for route data, navigation, and workflow decisions.
- Prefer semantic HTML before ARIA. When a custom interaction is justified, implement its complete keyboard operation, focus return, and screen-reader semantics rather than approximating a native control.
- Use Svelte lifecycle hooks only for browser-only integration and always remove listeners, timers, and document state in their cleanup function. Keep server-safe code outside browser-only hooks.
- Preserve SvelteKit navigation destinations exactly when resuming a guarded navigation, including pathname, search parameters, and hash fragments.
- Do not add dependencies or change framework/build configuration for a focused UI refinement unless the task explicitly requires it. Use the existing check, lint, format, unit, build, and browser-test commands before reporting completion.
