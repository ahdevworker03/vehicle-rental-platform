---
name: shadcn-best-practices
description: Guides responsible use of shadcn/ui in React and Tailwind projects. Helps choose the right primitives, compose reusable app components, preserve accessibility, avoid component bloat, and work correctly with Tailwind v4.
---

# shadcn Best Practices Skill

## How This Works

When using shadcn/ui in a project, follow this sequence:

1. **Inspect the project** — Check React version, Tailwind version, existing shadcn setup, component paths, aliases, and CSS token structure.
2. **Use existing components first** — Do not reinstall or duplicate components that already exist.
3. **Choose the right primitive** — Select components based on UX need, not visual preference.
4. **Compose app-level components** — Build domain components from shadcn primitives instead of styling every page manually.
5. **Preserve accessibility** — Do not remove Radix/shadcn accessibility behavior while customizing.
6. **Keep bundle and code clean** — Only add components that are actually needed.

## Project Inspection

Before making shadcn changes, check:

- `package.json`
- `components.json`
- Tailwind version
- CSS token file
- Component directory
- Import aliases
- Existing `components/ui`
- Existing app-specific components

For Tailwind v4 projects:

- Confirm token approach before editing CSS.
- Do not create a Tailwind v3-style config unless the project already uses one.
- Prefer CSS variables and the existing theme structure.

## Component Selection Rules

### Button

Use for primary, secondary, tertiary, and destructive actions.

Must include:

- Hover state
- Active state
- Focus-visible state
- Disabled state
- Loading state when async

Do not create many button variants without need.

### Card

Use for grouped content.

Good uses:

- KPI cards
- Dashboard sections
- Entity summaries
- Detail page panels

Avoid:

- Wrapping every small piece of content in a card
- Deep card nesting
- Cards with strong borders and strong shadows everywhere

### Table

Use for dense record comparison.

Good uses:

- Payments
- Expenses
- Rentals
- Customers
- Maintenance history
- Tasks

Must support:

- Empty state
- Loading state
- Responsive behavior
- Consistent row actions

### Dialog

Use for short, focused interactions.

Good uses:

- Delete confirmation
- Short confirmation
- Small edit action

Avoid:

- Large create/edit forms
- Multi-section workflows
- Anything that needs long scrolling

### Sheet / Drawer

Use for secondary panels and mobile-friendly workflows.

Good uses:

- Filters
- Details preview
- Quick actions
- Mobile menus

Do not use sheets as a replacement for every page.

### Tabs

Use when sections are peers.

Good uses:

- Detail page sections
- Analytics views
- Related records

Avoid tabs when a simple vertical section layout is clearer.

### Badge

Use for compact status and labels.

Rules:

- Keep status color consistent.
- Use short labels.
- Do not overload tables with too many badges.

### Form

Use the project’s established form pattern.

Must include:

- Label
- Error message
- Required state
- Consistent spacing
- Correct input type
- Validation integration

### Select / Combobox / Command

Use based on option count.

Guidelines:

- Select for small fixed lists.
- Combobox/Command for searchable long lists.
- Do not use a basic select for large customer or vehicle search if search is needed.

### Skeleton

Use for loading states that match the final layout.

Avoid generic spinner-only screens.

### Alert

Use for important status, warning, or error information.

Do not use alerts as decoration.

### Toast / Sonner

Use for temporary feedback.

Good uses:

- Saved successfully
- Action failed
- Payment recorded
- Record deleted

Avoid:

- Critical errors that need persistent explanation
- Replacing inline form validation

## App-Level Composition

Do not use raw primitives directly everywhere.

Create reusable app components such as:

- PageShell
- PageHeader
- SectionCard
- KpiCard
- DataTable
- StatusBadge
- EntitySummaryCard
- FilterBar
- EmptyState
- FormSection
- DetailPanel
- ActionBar

These components should wrap shadcn primitives and enforce the product design system.

## Accessibility Rules

Do not remove:

- Focus management
- Keyboard support
- ARIA behavior
- Dialog labels
- Form labels
- Focus-visible styling

Every interactive component must be usable by keyboard.

Every dialog/sheet must have a clear title.

Every form input must have a label.

## Styling Rules

Use:

- Existing theme tokens
- CSS variables
- Existing utility patterns
- Consistent variants

Avoid:

- Raw hex colors
- One-off arbitrary classes
- Duplicate variants
- Hardcoded widths
- Inline styles
- Tailwind config changes without checking version

## Component Bloat Control

Before adding a new shadcn component, ask:

- Is this component already installed?
- Can an existing component solve this?
- Is this needed for more than one place?
- Does it improve usability?
- Will it increase maintenance cost?

If the answer is weak, do not add it.

## shadcn QA Checklist

Before accepting changes:

- No duplicate component files.
- Imports match project aliases.
- Components compile.
- Variants are consistent.
- Accessibility behavior remains intact.
- Styling uses tokens.
- Responsive behavior is defined.
- No unnecessary components were added.
- UI still matches the product design direction.

## Rules

- Use shadcn as a foundation, not as a complete design system by itself.
- Compose product-specific components on top of shadcn primitives.
- Do not blindly paste blocks without adapting them to the project.
- Do not change the product’s architecture for component convenience.
