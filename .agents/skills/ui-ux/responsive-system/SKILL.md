---
name: responsive-system
description: Designs and reviews responsive layouts for production SaaS apps. Prevents stretched mobile layouts, cramped desktop pages, broken tablet states, unusable tables, and inconsistent responsive spacing.
---

# Responsive System Skill

## How This Works

When applied to a frontend project, follow this sequence:

1. **Inspect the current layout** — Identify containers, breakpoints, sidebars, grids, tables, forms, and mobile navigation.
2. **Define responsive behavior** — Decide how each layout changes across mobile, tablet, laptop, desktop, and wide desktop.
3. **Fix layout structure first** — Improve containers, grids, and shell before individual screen styling.
4. **Test real widths** — Verify layouts at the required viewport widths.
5. **Preserve usability** — Responsive changes must improve the workflow, not only visual appearance.

## Required Viewport Targets

Test and design for:

- 375px
- 768px
- 1024px
- 1440px
- 1920px

These widths represent:

- Mobile
- Tablet
- Small laptop
- Desktop
- Wide desktop

## Core Principle

Do not stretch mobile layouts to desktop.

A good responsive SaaS layout changes structure across screen sizes.

It does not only increase width.

## Layout Rules

### Containers

Use max-width containers for readable content.

Guidelines:

- Dense dashboards may use wider containers.
- Forms should not stretch too wide.
- Detail pages can use multi-column layouts.
- Tables may use wider areas.
- Avoid full-width content that becomes hard to scan on 1440px and 1920px screens.

### Grid Behavior

Use grid for page structure.

Prefer:

- 1 column on mobile
- 2 columns on tablet when useful
- 3–4 columns for dashboard KPI cards on desktop
- wider analytical layouts on large screens

Avoid:

- Complex percentage flexbox layouts
- Hardcoded pixel widths
- Layouts that only work at one screen size
- Cards becoming extremely wide on desktop

### Sidebar Behavior

Desktop:

- Use full sidebar.
- Keep navigation persistent.
- Main content should adapt to remaining width.

Tablet:

- Sidebar may collapse, become icon-only, or move to a drawer depending on available width.
- Content must not feel squeezed.

Mobile:

- Use compact navigation.
- Keep common modules accessible.
- Avoid blocking workflows behind too many taps.

### Page Header Behavior

Page headers should adapt.

Desktop:

- Title, description, actions, filters, and breadcrumbs can share horizontal space.

Mobile:

- Stack title and actions.
- Keep primary action visible.
- Move secondary filters into sheet/drawer if needed.

### Tables

Tables must remain usable across devices.

Desktop:

- Use full tables with columns, sorting, filters, and pagination where available.

Tablet:

- Reduce secondary columns.
- Allow horizontal scrolling only when necessary.
- Consider card-table hybrid patterns.

Mobile:

- Avoid tiny compressed tables.
- Convert records into stacked rows/cards when better.
- Keep key fields visible.
- Put secondary details behind expansion or detail page.

### Forms

Forms should adapt by complexity.

Desktop:

- Use grouped sections.
- Use two-column fields where the relationship is clear.
- Keep labels aligned and readable.
- Avoid unnecessarily narrow form pages.

Mobile:

- Use single-column forms.
- Keep field groups clear.
- Keep submit actions reachable.
- Avoid side-by-side fields that become cramped.

### Detail Pages

Detail pages should use available width.

Desktop pattern:

- Main content column
- Secondary summary/action panel
- Related records sections
- Timeline or history sections where useful

Mobile pattern:

- Summary first
- Primary actions near top
- Sections stacked
- Related records below

### Dashboard

Dashboard should be dense but organized.

Desktop:

- KPI grid
- Alerts
- Financial overview
- Fleet status
- Recent activity
- Tasks/reminders
- Charts/tables

Mobile:

- Prioritize urgent operational status
- Collapse secondary analytics
- Keep cards short
- Avoid long dashboard walls if possible

## Spacing Rules

Use consistent spacing scales.

Avoid:

- Random padding values
- Huge desktop gaps
- Cramped mobile sections
- Same padding for every layout regardless of size

Prefer:

- Smaller spacing on mobile
- Balanced spacing on tablet
- Larger but controlled spacing on desktop
- Section gaps that reflect hierarchy

## Touch and Interaction

Interactive elements must remain usable on touch devices.

Verify:

- Buttons are large enough.
- Click targets are not crowded.
- Filter chips can be tapped.
- Dropdowns and sheets are usable.
- Tables do not require precise tiny taps.

## RTL and Future LTR Readiness

For Arabic RTL now and English LTR later:

- Avoid hardcoded left/right styles when logical alternatives exist.
- Prefer `start` and `end` thinking.
- Use `ms-*` and `me-*` style direction-aware utilities when available.
- Avoid positioning icons in a way that breaks in LTR.
- Keep layout logic direction-safe.

## Responsive QA Checklist

At every target width, verify:

- No horizontal overflow.
- Navigation works.
- Primary action is visible.
- Cards do not become too wide.
- Tables remain usable.
- Forms are readable.
- Dashboard hierarchy still works.
- Text does not collide or wrap badly.
- Sidebar/topbar/mobile nav behave correctly.
- Spacing feels intentional.
- RTL alignment remains correct.

## Rules

- Do not solve responsiveness by hiding important functionality.
- Do not rely only on mobile testing.
- Do not add new layout libraries unless explicitly approved.
- Work within the existing styling system.
- Prefer structural layout fixes over one-off CSS patches.
