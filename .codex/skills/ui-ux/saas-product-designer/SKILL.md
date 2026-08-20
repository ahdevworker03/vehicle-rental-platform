---
name: saas-product-designer
description: Designs professional B2B SaaS product interfaces. Focuses on dashboard hierarchy, dense operational workflows, navigation, forms, tables, empty states, and responsive SaaS layouts without turning the app into a marketing website.
---

# SaaS Product Designer Skill

## How This Works

When applied to a SaaS product interface, follow this sequence:

1. **Understand the product** — Identify the users, business workflows, daily tasks, key entities, and operational priorities.
2. **Prioritize information** — Decide what users need to see first, what belongs in secondary sections, and what should be hidden behind details or filters.
3. **Design for work** — Optimize screens for speed, scanning, decision-making, and repeated daily use.
4. **Preserve functionality** — Improve UI and UX without changing business behavior, API contracts, or core workflows unless explicitly instructed.
5. **Review density** — SaaS screens may be dense, but they must remain readable, organized, and responsive.

## SaaS Design Principles

### Product First

The interface exists to help users complete business work.

Do not design pages like landing pages.

Avoid:

- Hero sections
- Marketing slogans
- Decorative feature grids
- Testimonials
- Pricing-style layouts
- Excessive whitespace that reduces operational efficiency
- Visual effects that distract from data

Prefer:

- Clear navigation
- Dense but readable layouts
- Fast access to primary actions
- Tables, cards, and summaries used intentionally
- Strong information hierarchy
- Practical empty, loading, and error states

### Dashboard Hierarchy

A SaaS dashboard should answer:

- What is happening now?
- What needs attention?
- What changed recently?
- What should the user do next?

Prioritize dashboard sections in this order:

1. Critical operational status
2. Key metrics
3. Alerts and exceptions
4. Recent activity
5. Shortcuts to common actions
6. Secondary insights

Do not show charts only because dashboards usually have charts.

Every chart must answer a real business question.

### Navigation

Navigation should make the product feel stable and predictable.

Use:

- Persistent desktop sidebar for primary modules
- Clear active route state
- Consistent module order
- Short labels
- Grouped navigation when the product grows
- Mobile navigation that keeps common workflows reachable

Avoid:

- Hidden navigation on desktop
- Random action placement
- Multiple competing navigation systems
- Navigation labels that change between screens

### Tables vs Cards

Use tables when users compare many records.

Good table use cases:

- Rentals
- Payments
- Expenses
- Customers
- Tasks
- Maintenance history

Use cards when users need quick scanning of entity summaries.

Good card use cases:

- Vehicle summaries
- Dashboard KPIs
- Alert blocks
- Detail-page sections

Do not replace every table with cards. Dense SaaS products need tables.

### Forms

Forms should be fast and predictable.

Rules:

- Group related fields into clear sections.
- Put primary actions in consistent locations.
- Use inline validation.
- Show required fields clearly.
- Avoid modals for large forms.
- Use dialogs only for short confirmations or small actions.
- Prefer full pages or side panels for complex create/edit flows.
- Preserve entered data when possible.
- Make error messages specific and direct.

### Empty States

Empty states should help users move forward.

Each empty state should include:

- What is missing
- Why it matters
- The next useful action

Avoid generic messages like:

- "No data found"
- "Nothing here yet"
- "Start your journey"

Use business-specific text.

### Loading States

Use skeletons that match the final layout.

Avoid:

- Generic full-page spinners
- Layout jumps
- Empty screens while loading
- Loading states that hide navigation

### Error States

Errors should be calm and specific.

Use:

- Clear message
- Recovery action
- Retry button when appropriate
- Contextual placement near the failed section

Avoid:

- "Oops"
- Exclamation-heavy messages
- Technical stack traces
- `window.alert()`

## SaaS Layout Rules

### Desktop

Desktop layouts should use space intentionally.

Use:

- Sidebar plus main content
- Multi-column detail pages
- KPI grids
- Tables with filters
- Sectioned forms
- Sticky page actions when useful

Avoid:

- Mobile layouts stretched to desktop width
- Single narrow column on wide screens unless content requires it
- Huge cards with little information
- Excessive vertical scrolling caused by poor desktop layout

### Tablet

Tablet should be treated as a real breakpoint.

Use:

- Two-column grids where useful
- Condensed navigation
- Responsive tables or card-table hybrids
- Layouts that avoid both cramped mobile and over-wide desktop patterns

### Mobile

Mobile should keep core workflows usable.

Use:

- Stacked sections
- Clear primary actions
- Short cards
- Search and filters that are easy to reach
- Bottom or compact navigation if appropriate

Avoid:

- Wide tables without adaptation
- Tiny touch targets
- Hidden primary actions
- Overloaded dashboard sections

## SaaS Visual Quality Checklist

Before accepting a screen, verify:

- Primary action is obvious.
- Important data is visible without hunting.
- Spacing is consistent.
- Typography hierarchy is clear.
- Tables are readable.
- Cards are not overused.
- Empty states guide the user.
- Loading states match the layout.
- Error states are actionable.
- Desktop uses available space well.
- Mobile remains efficient.
- The screen feels like a real SaaS product, not a template.

## Rules

- Do not redesign the product workflow unless explicitly asked.
- Do not add decorative sections that do not support user work.
- Do not introduce new libraries unless the project already uses them or approval is given.
- Keep changes focused, reviewable, and aligned with the existing architecture.
- Prefer reusable SaaS patterns over one-off screen styling.
