---
name: design-system-guardian
description: Protects visual and component consistency across a product UI. Reviews colors, spacing, typography, radii, shadows, components, icons, states, accessibility, and responsive behavior before changes are accepted.
---

# Design System Guardian Skill

## How This Works

When applied to a UI rebuild, follow this sequence:

1. **Identify existing tokens** — Inspect colors, typography, spacing, border radius, shadows, and component variants.
2. **Detect inconsistencies** — Find one-off styles, repeated custom components, arbitrary values, and visual drift.
3. **Consolidate patterns** — Recommend reusable tokens and components instead of screen-specific styling.
4. **Enforce consistency** — Every new screen should use the shared design system.
5. **Review before acceptance** — A screen is not complete if it visually works but breaks system consistency.

## Core Principle

A product UI should look like one system.

Not a collection of screens generated at different times.

## Token Review

### Colors

Check for:

- Too many accent colors
- Inconsistent blues
- Mixed warm and cool grays
- Status colors used inconsistently
- Low contrast text
- Hardcoded colors outside tokens
- Decorative gradients without purpose

Rules:

- Use one primary brand color family.
- Use neutral surfaces consistently.
- Use status colors only for status meaning.
- Keep color usage predictable.
- Prefer tokens/CSS variables over raw hex values.

### Typography

Check for:

- Too many font sizes
- Missing hierarchy
- Inconsistent weights
- Poor number alignment
- Dense table text that is hard to read
- Labels styled differently across screens

Rules:

- Define heading, body, label, table, and number styles.
- Use tabular numbers for KPIs, money, and tables.
- Keep Arabic typography readable.
- Use consistent font weights for similar roles.

### Spacing

Check for:

- Random padding
- Random gaps
- Different card spacing across modules
- Too much space on desktop
- Cramped mobile screens

Rules:

- Use a clear spacing scale.
- Keep similar components aligned.
- Use consistent page gutters.
- Use consistent section spacing.
- Adjust spacing responsively.

### Border Radius

Check for:

- Every element using the same radius
- Random one-off rounded values
- Inconsistent button/card/input shapes

Rules:

- Define radius levels:
  - small controls
  - inputs/buttons
  - cards
  - panels
  - large containers
- Use tighter radius inside larger surfaces.
- Do not create arbitrary radius values.

### Shadows and Borders

Check for:

- Generic shadows everywhere
- Cards using both strong border and strong shadow
- Inconsistent elevation
- No hierarchy between surfaces

Rules:

- Use subtle elevation.
- Use either border, background contrast, or shadow intentionally.
- Keep elevation levels consistent.
- Avoid making every section a card.

### Icons

Check for:

- Inconsistent icon sizes
- Inconsistent stroke widths
- Cliche icon choices
- Icons used where text is clearer
- Icons that flip incorrectly in RTL

Rules:

- Standardize icon size and stroke.
- Use icons to support recognition, not decoration.
- Keep icon placement direction-safe.
- Do not mix many icon styles.

## Component Review

### Buttons

Check:

- Primary, secondary, tertiary variants are clear.
- Destructive actions are visually distinct.
- Loading/disabled states exist.
- Button sizes are consistent.
- Buttons have hover, active, focus states.

### Cards

Check:

- Cards are used for real grouping.
- Card padding is consistent.
- Headers align across card groups.
- KPI cards use the same pattern.
- Cards do not become giant empty boxes on desktop.

### Tables

Check:

- Header style is consistent.
- Row height is appropriate.
- Numeric columns align properly.
- Actions are consistent.
- Empty table state exists.
- Responsive behavior is defined.

### Forms

Check:

- Label style is consistent.
- Error style is consistent.
- Required fields are clear.
- Field spacing is consistent.
- Submit/cancel placement is consistent.
- Long forms use sections.

### Badges and Status

Check:

- Same status has same color everywhere.
- Status labels are clear.
- Badge shape is consistent.
- Badges do not overload the screen.

### Empty, Loading, and Error States

Check:

- Empty states are useful.
- Skeletons match layout.
- Errors are specific and recoverable.
- No generic spinner-only screens unless unavoidable.

## Accessibility Review

Check:

- Focus states are visible.
- Text contrast is acceptable.
- Interactive controls are keyboard reachable.
- Disabled states are understandable.
- Color is not the only status indicator.
- Motion is subtle and respects reduced-motion preferences.

## Responsive Review

Check:

- Design system components adapt across target widths.
- Tables, cards, forms, and sidebars have defined responsive behavior.
- Layouts do not depend on one screen size.
- RTL behavior is preserved.

## Anti-Drift Rules

Do not allow:

- One-off color values
- One-off spacing values
- One-off card styles
- One-off button styles
- Screen-specific status colors
- Arbitrary z-index values
- Repeated custom implementations of the same pattern
- New component variants without clear need

## Acceptance Checklist

Before accepting any screen:

- Does it use the shared tokens?
- Does it use existing reusable components?
- Are spacing and alignment consistent?
- Are states implemented?
- Is responsive behavior correct?
- Does it match the product's visual direction?
- Does it avoid generic AI dashboard patterns?
- Does it preserve accessibility?
- Does it feel like part of the same product?

## Rules

- Prefer improving shared components over patching individual screens.
- Do not create new variants unless the need repeats or is clearly justified.
- Do not introduce a new visual pattern for a single screen.
- Keep the design system simple enough to maintain.
