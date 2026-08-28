# Frontend Architecture

## Purpose

This document describes the active frontend application in `apps/web` (`@workspace/web`). It covers the source structure, routing, layout, state management, data flow, component ownership, styling, testing, and build workflow.

The frontend is an Arabic-first, RTL tenant-facing React application. It is partially API-backed through the generated React Query client. Transitional local data remains only for legacy dashboard and analytics consumers until their dedicated data-consistency work is completed.

## Technology

- React 19 and strict TypeScript
- Vite 7 with `@vitejs/plugin-react` and `@tailwindcss/vite`
- Tailwind CSS 4 with tokens defined in `src/index.css`
- Wouter for client-side routing
- Radix UI primitives wrapped with Tailwind in the shadcn-style `components/ui` layer
- TanStack React Query 5 through `@workspace/api-client-react`
- React Hook Form and Zod where form-level validation is required
- Vitest, jsdom, and React Testing Library

## Source Layout

```text
apps/web/src/
├── main.tsx                 Application entry point
├── App.tsx                  Wouter route composition and provider boundary
├── index.css                Tailwind entry, design tokens, RTL utilities
├── app/
│   └── NotFoundPage.tsx     Application-level unmatched route
├── features/                Feature-owned pages, components, hooks, adapters, selectors, and tests
│   ├── auth/
│   ├── dashboard/
│   ├── vehicles/
│   ├── customers/
│   ├── rentals/
│   ├── contracts/
│   ├── payments/
│   ├── maintenance/
│   ├── expenses/
│   ├── tasks/
│   ├── analytics/
│   ├── reports/
│   └── media/
├── components/
│   ├── layout/              Shared shell, navigation, page primitives
│   └── ui/                  Shared shadcn-style and application-neutral components
├── providers/               Query and authentication providers
├── hooks/                   Shared general-purpose hooks
├── lib/                     Formatting, labels, API errors, tokens, and utilities
├── data/                    Transitional local data used by legacy consumers
└── test/                    Vitest and Testing Library setup
```

Feature pages are colocated under `features/<feature>/pages`. Domain components and API adapters are colocated under the same feature. Each feature may expose stable public entries through its `index.ts`; callers should not depend on another feature's private implementation files.

## Routing

`apps/web/src/App.tsx` is the Wouter composition root. It mounts `QueryProvider`, `AuthProvider`, `TooltipProvider`, and the base-path-aware Wouter router.

The outer switch handles public and focused flows. Protected full-screen create flows render outside `AppShell` so persistent navigation does not compete with transaction completion. The protected shell handles the remaining tenant routes.

| Route | Feature owner | Layout |
|---|---|---|
| `/login` | `features/auth` | Public |
| `/` | `features/dashboard` | Protected `AppShell` |
| `/vehicles*` | `features/vehicles` | Protected `AppShell` |
| `/customers*` | `features/customers` | Protected `AppShell` |
| `/rentals/new` | `features/rentals` | Protected full-screen |
| `/rentals*` | `features/rentals` | Protected `AppShell` |
| `/maintenance/add` | `features/maintenance` | Protected full-screen |
| `/maintenance*` | `features/maintenance` | Protected `AppShell` |
| `/expenses*` | `features/expenses` | Protected `AppShell` |
| `/tasks/add` | `features/tasks` | Protected full-screen |
| `/tasks*` | `features/tasks` | Protected `AppShell` |
| `/analytics` | `features/analytics` | Protected `AppShell` |
| `/reports` | `features/reports` | Protected `AppShell` |
| unmatched route | `app/NotFoundPage.tsx` | Protected shell fallback |

The base path comes from `import.meta.env.BASE_URL`. Route ownership is composed in `App.tsx`; feature modules do not define competing global routers.

## Layout and Navigation

`components/layout/AppShell.tsx` owns the protected application frame, scroll region, skip link, page container, and responsive navigation composition.

- `AppSidebar.tsx` provides desktop grouped navigation.
- `TabletNavigationRail.tsx` provides the compact tablet navigation.
- `BottomNavigation.tsx` provides the mobile primary destinations and More entry.
- `NavigationDrawer.tsx` provides the mobile secondary navigation surface.
- `navigation.ts` is the shared navigation definition and active-route logic.
- `PageContainer.tsx`, `PageHeader.tsx`, `PageActionArea.tsx`, and `ContentGrid.tsx` provide shared page structure.

The shell keeps page content scrollable, accounts for mobile safe-area space, and preserves keyboard skip-link behavior. Feature pages should not recreate shell gutters or navigation logic.

## State and Data Flow

There is no external global state library.

- Local UI state uses React state for filters, form inputs, and disclosure controls.
- Server state uses TanStack React Query and generated hooks from `@workspace/api-client-react`.
- Query and mutation ownership belongs to the owning feature adapter.
- `features/vehicles/api-hooks.ts` and `features/customers/api-hooks.ts` centralize list/detail queries and mutation invalidation.
- `features/rentals/api-hooks.ts`, `features/media/hooks.ts`, `features/contracts/hooks.ts`, `features/payments/hooks.ts`, `features/maintenance/hooks.ts`, `features/expenses/hooks.ts`, `features/tasks/hooks.ts`, and `features/reports/hooks.ts` provide feature-specific API behavior.
- Pure selectors remain under their owning feature and are unit tested where calculations or derived states are non-trivial.
- `providers/QueryProvider.tsx` owns the shared QueryClient provider.
- `providers/AuthProvider.tsx` owns current-user restoration and authentication context.

The generated client is sourced from `lib/api-spec/openapi.yaml`. Generated packages are not edited manually.

### Transitional Local Data

`features/vehicles/hooks.ts`, `features/customers/hooks.ts`, and `features/rentals/hooks.ts` still expose local-data contracts for legacy dashboard and analytics selectors. This is an explicit transitional boundary, not the preferred data path. The local `data/` directory and `lib/mock-date.ts` must not be removed until those consumers use authoritative generated response types and current API data.

## Component Ownership

### Shared Layout

Shared shell and page composition remain in `components/layout`.

### Shared UI

`components/ui` contains shadcn-style primitives and application-neutral composites such as buttons, inputs, cards, dialogs, sheets, tables, skeletons, status badges, feedback states, form fields, search, filters, section cards, and section headers.

### Feature Components

Domain-specific components live under their owning feature:

- Vehicle cards, forms, lists, availability, and status presentation: `features/vehicles/components`
- Customer cards, forms, and lists: `features/customers/components`
- Rental cards, lists, and rental history: `features/rentals/components`
- Contract presentation: `features/contracts/components`
- Payment presentation: `features/payments/components`
- Maintenance cards, lists, and history: `features/maintenance/components`
- Expense cards, lists, and category presentation: `features/expenses/components`
- Task cards and lists: `features/tasks/components`
- Media galleries and document lists: `features/media/components`
- Report period controls: `features/reports/components`

Shared layers must not import feature pages or domain internals. Cross-feature composition uses a feature's public entry point when a related feature component is intentionally reused.

## Styling and RTL

- Tailwind CSS 4 is configured through `@tailwindcss/vite`; there is no Tailwind config file.
- Semantic design tokens are defined in `src/index.css`.
- Arabic is the document language and RTL is set in `index.html`.
- The application font is IBM Plex Sans Arabic.
- `lib/format.ts` owns currency, date, and number formatting.
- Numeric and mixed-direction values use the shared LTR treatment where needed.
- New UI should use logical `start`/`end` properties rather than physical left/right positioning.
- The design-system baseline is documented in `docs/architecture/12-ui-design-system.md`.

## Forms and Feedback

Feature forms use shared field and section primitives, generated request types, and feature-owned mutation adapters. User-facing API errors are mapped through `lib/api-error.ts`.

Shared feedback components provide loading, empty, error, inline-error, and informational states. Screens must distinguish valid zero values from unavailable or failed data and must show submitting state for mutations.

## Testing

Tests are colocated with the feature or shared component they cover. The test environment is configured in `src/test/setup.ts`.

Run the frontend suite with:

```sh
pnpm --filter @workspace/web test
```

The current suite covers feature selectors, API-backed page behavior, shared components, form flows, and dashboard/task/payment states. Changes to route composition, feature boundaries, shared UI, or API adapters should include corresponding regression coverage.

## Build and Development

`apps/web/vite.config.ts` defines the Vite base path, `@` source alias, `@assets` alias, React/Tailwind plugins, development server, and `dist/public` output.

Available commands:

```sh
pnpm --filter @workspace/web dev
pnpm --filter @workspace/web typecheck
pnpm --filter @workspace/web test
pnpm --filter @workspace/web build
```

The repository-wide lint command is `pnpm lint`.

## Architectural Boundaries

1. `App.tsx` owns global providers and route composition.
2. Features own domain pages, components, API adapters, selectors, and related tests.
3. Shared components remain domain-neutral unless they are explicitly assigned to a feature.
4. Feature code may use shared components, layout, hooks, lib utilities, providers, and generated client packages.
5. Features do not import another feature's private implementation files.
6. API contracts are changed only in `lib/api-spec`; generated clients and schemas are regenerated from the contract.
7. Local data remains transitional and cannot be mixed with API data for the same visible entity without an explicit, truthful state model.
