# UI Design System

## Purpose

This document defines the visual and interaction design system for the Vehicle Rental Management Platform.

Its purpose is to keep the rebuilt frontend consistent, professional, responsive, and suitable for a real vehicle rental SaaS product.

This document supports **Milestone 5.5 — Product UI Rebuild** and should be used as the design reference before implementing or reviewing frontend UI work.

The design system should guide:

- Layout
- Colors
- Typography
- Spacing
- Components
- Responsive behavior
- Arabic RTL interface design
- Future English/LTR readiness
- Accessibility
- Visual QA

---

# Design Goal

The interface should feel like a clean, professional, modern SaaS dashboard for vehicle rental businesses.

The product should feel:

- Trustworthy
- Operational
- Practical
- Business-focused
- Modern
- Clear
- Reliable

The interface should not feel like:

- A portfolio website
- A landing page
- A generic admin template
- An AI-generated dashboard
- A flashy startup demo
- A mobile app stretched onto desktop

---

# Design Direction

## Style

The approved style direction is:

> Clean professional + modern SaaS dashboard

The UI should support daily business operations, not marketing presentation.

Visual design should improve:

- Speed of use
- Information scanning
- Data clarity
- Workflow confidence
- Business visibility

Decoration should be minimal and purposeful.

---

## Brand Direction

The approved brand direction is:

> Blue / trust

Blue should be the main brand color family.

Use blue to communicate:

- Trust
- Stability
- Professionalism
- System identity
- Primary actions

Blue should not be overused. It should guide the interface, not dominate every surface.

---

# Design Principles

## Business First

Every UI decision should support the daily work of vehicle rental businesses.

The interface must help users:

- Find vehicles quickly
- Understand vehicle status
- Create and manage rentals
- Track payments and balances
- Monitor maintenance
- Review business performance
- Act on urgent operational issues

Do not add visual elements that do not support business use.

---

## Simplicity

Prefer simple, maintainable design patterns.

Avoid unnecessary:

- Visual effects
- Complex animations
- Decorative gradients
- Over-designed cards
- Unclear abstractions
- One-off layouts

Complexity is acceptable only when it improves usability.

---

## Consistency

The product should look like one system.

Similar screens should use similar:

- Page structure
- Spacing
- Typography
- Buttons
- Tables
- Cards
- Forms
- Status badges
- Empty states
- Loading states
- Error states

Avoid one-off styling unless there is a clear product reason.

---

## Density With Clarity

This product is an operational SaaS. Some screens should be dense.

Density is acceptable for:

- Dashboards
- Tables
- Reports
- Analytics
- Detail pages
- Operational lists

Density is not acceptable when it causes:

- Poor readability
- Weak hierarchy
- Visual noise
- Crowded actions
- Confusing status display

The goal is not “more content everywhere.”  
The goal is “more useful information where it helps business decisions.”

---

## Responsive By Design

The interface should adapt to device size.

It should not simply stretch or shrink.

The UI must work well on:

- Mobile
- Tablet
- Laptop
- Desktop
- Wide desktop

Desktop should use available space properly.

Mobile should remain fast and focused.

Tablet should not feel accidental.

---

## Arabic First, LTR Ready

The current product interface is Arabic RTL.

The design system must support Arabic well now while avoiding decisions that block English/LTR support later.

Rules:

- Use RTL-safe spacing and alignment.
- Prefer start/end thinking over left/right thinking.
- Avoid hardcoded directional assumptions.
- Keep icon placement direction-aware.
- Keep Arabic labels short enough for UI constraints.
- Avoid layouts that only work in one direction.

---

# Layout System

## App Shell

The app shell should provide a stable structure across the product.

Desktop layout:

- Full sidebar
- Main content area
- Optional topbar/header
- Responsive content container

Mobile layout:

- Compact navigation
- Stacked content
- Clear primary actions
- No desktop-only dependency

Tablet layout:

- Adaptive navigation
- Balanced content width
- Two-column layouts where useful

---

## Sidebar

Desktop uses a full sidebar.

Sidebar should include primary modules:

- لوحة التحكم
- المركبات
- العملاء
- الإيجارات
- الصيانة
- المصاريف
- المدفوعات
- المهام
- التحليلات
- التقارير
- الإعدادات

Rules:

- Active route must be clearly visible.
- Icons and labels must align consistently.
- Sidebar width should be stable.
- Sidebar should not visually overpower the content.
- Navigation order should match business workflow priority.

---

## Page Structure

Standard page structure:

1. Page header
2. Primary actions
3. Filters/search if applicable
4. Main content
5. Secondary sections
6. Empty/loading/error states where needed

Page header may include:

- Title
- Description
- Breadcrumb/back action
- Primary action
- Secondary actions

---

## Content Width

Desktop content should not stretch endlessly.

Use controlled content widths:

- Dashboard: wide layout allowed
- Tables: wide layout allowed
- Forms: constrained width
- Detail pages: multi-column structure
- Reports/analytics: wide but organized

Avoid:

- Narrow mobile-style column on desktop
- Edge-to-edge content on wide desktop
- Overly wide paragraphs
- Giant cards with little content

---

# Responsive Targets

Every rebuilt screen should be reviewed at:

- 375px
- 768px
- 1024px
- 1440px
- 1920px

## 375px — Mobile

Expected behavior:

- Single-column layout
- Compact navigation
- Clear primary action
- Stacked sections
- No horizontal overflow
- Tables adapt into cards or scroll only when justified

## 768px — Tablet

Expected behavior:

- Balanced layout
- Optional two-column sections
- Navigation adapts cleanly
- Tables remain readable
- Forms use available width without becoming crowded

## 1024px — Small Laptop

Expected behavior:

- Desktop shell begins to feel useful
- Sidebar/content balance works
- Dashboard starts using multi-column layout
- Detail pages avoid mobile-stretched appearance

## 1440px — Desktop

Expected behavior:

- Full desktop layout
- Dense dashboard works well
- Tables and reports use width effectively
- Forms and detail pages are structured into useful sections

## 1920px — Wide Desktop

Expected behavior:

- Content remains controlled
- No excessive stretching
- Dashboard/grid layout remains intentional
- Large empty areas are avoided or used purposefully

---

# Color System

## Direction

Use a blue/trust primary color system with neutral supporting surfaces.

Recommended color roles:

- Primary
- Primary foreground
- Background
- Surface/card
- Muted surface
- Border
- Text
- Muted text
- Success
- Warning
- Danger
- Info

Exact values should be implemented as design tokens.

---

## Usage Rules

### Primary Blue

Use for:

- Primary actions
- Active navigation
- Important links
- Key highlights
- Selected states

Do not use primary blue for every icon, card, and heading.

---

### Neutrals

Use neutrals for:

- Backgrounds
- Cards
- Borders
- Muted text
- Table rows
- Disabled states

Neutral colors should feel consistent.

Avoid mixing warm and cool gray families randomly.

---

### Status Colors

Status colors should communicate business meaning.

Suggested direction:

| Meaning               | Color direction                        |
| --------------------- | -------------------------------------- |
| Available / success   | Green                                  |
| Active / primary      | Blue                                   |
| Reserved / scheduled  | Blue or indigo                         |
| Maintenance / warning | Amber                                  |
| Overdue / danger      | Red                                    |
| Cancelled / archived  | Muted gray                             |
| Completed             | Green or neutral, depending on context |

Rules:

- Same status should use the same color everywhere.
- Do not use status colors as decoration.
- Do not rely only on color; labels must remain clear.

---

# Typography

## Font Direction

The UI must use a font that works well for Arabic business software.

Recommended Arabic-first options:

- Cairo
- IBM Plex Sans Arabic
- Noto Sans Arabic

If the current font is working well, keep it unless there is a clear reason to change.

Future English/LTR support should use a compatible Latin font pairing.

---

## Typography Rules

Use a clear hierarchy:

- Page title
- Section title
- Card title
- Body text
- Label text
- Table text
- Muted helper text
- Numeric/KPI text

Rules:

- Use medium and semibold weights for hierarchy.
- Avoid relying only on bold and regular.
- Use readable line height.
- Keep labels concise.
- Use tabular numbers for money, KPIs, and tables.
- Avoid huge marketing-style headings inside the app.

---

# Spacing System

Spacing should be consistent across the product.

Use a clear spacing scale for:

- Page gutters
- Section gaps
- Card padding
- Form gaps
- Table row height
- Button spacing
- Sidebar spacing

Rules:

- Mobile spacing should be compact but readable.
- Desktop spacing should breathe without wasting space.
- Similar components should use similar spacing.
- Avoid random one-off padding values.
- Avoid cards that are too large for their content.

---

# Radius and Surfaces

## Border Radius

Use radius levels:

- Small radius for inner controls
- Medium radius for buttons/inputs
- Larger radius for cards/panels
- Largest radius only for major containers if needed

Avoid:

- Same radius on every element
- Random radius values
- Overly rounded “toy app” appearance

---

## Cards and Panels

Cards should be used when they help group related content.

Good uses:

- KPI cards
- Dashboard sections
- Detail panels
- Entity summaries
- Alerts
- Related records

Avoid:

- Wrapping every small text block in a card
- Strong shadow on every card
- Deep card nesting
- Generic border + shadow + white card everywhere

Use elevation carefully.

A SaaS product can feel polished with subtle borders, background contrast, and controlled shadows.

---

# Components

## Buttons

Button variants should include:

- Primary
- Secondary
- Tertiary/ghost
- Destructive
- Disabled
- Loading

Rules:

- Primary action should be visually obvious.
- Destructive actions must be clearly distinct.
- Do not use too many primary buttons on one screen.
- Buttons need hover, active, focus, and disabled states.

---

## Tables

Tables are important for this product.

Use tables for:

- Rentals
- Customers
- Payments
- Expenses
- Maintenance history
- Tasks
- Reports

Rules:

- Numeric values should align consistently.
- Row actions should be predictable.
- Empty states should be designed.
- Loading should use table-shaped skeletons.
- Mobile behavior must be defined.
- Do not compress too many columns on mobile.

---

## Cards

Use cards for:

- Vehicle summaries
- KPI metrics
- Dashboard blocks
- Alerts
- Detail sections

Rules:

- Cards must have consistent padding.
- Similar card groups should align.
- KPI cards should use consistent numeric styling.
- Cards should not become huge empty boxes on desktop.

---

## Forms

Forms should be clear and fast.

Rules:

- Group related fields.
- Use consistent label placement.
- Show inline validation.
- Keep submit/cancel actions predictable.
- Avoid modals for large forms.
- Use full pages or side panels for complex workflows.
- Use two-column layouts on desktop where useful.
- Use single-column layouts on mobile.

---

## Status Badges

Status badges should be consistent.

Use for:

- Vehicle status
- Rental status
- Maintenance status
- Task status
- Payment/balance state
- Derived overdue/upcoming states

Rules:

- Same status = same label + same visual treatment.
- Badge labels should be short.
- Badges should not overload the screen.
- Do not invent new persisted statuses in the UI.

---

## Empty States

Empty states should be specific and useful.

Each empty state should include:

1. What is missing
2. Why it matters or where it will appear
3. Next action if applicable

Avoid generic empty text.

Example:

```text
لا توجد مركبات بعد.
أضف أول مركبة لبدء إدارة الأسطول.
```

---

## Loading States

Use skeleton loaders that match the layout.

Avoid:

- Full-page spinner as default
- Blank screens
- Layout jumps
- Loading states that hide navigation

---

## Error States

Error states should be calm, direct, and actionable.

Examples:

```text
تعذر تحميل البيانات. تحقق من الاتصال.
```

```text
تعذر حفظ التغييرات. حاول مرة أخرى.
```

Avoid:

- “Oops”
- Exclamation marks
- Technical error dumps
- Generic “Something went wrong” without recovery

---

# Dashboard Design

The dashboard should be dense and metrics-rich.

It should help the business owner understand the current state of the business quickly.

## Recommended Sections

1. KPI overview
2. Operational alerts
3. Fleet status
4. Rental activity
5. Financial summary
6. Outstanding balances
7. Upcoming/overdue returns
8. Maintenance summary
9. Tasks due soon
10. Recent activity
11. Analytics/report shortcuts

## Dashboard Rules

- Show urgent operational issues clearly.
- Keep KPI cards consistent.
- Use charts only when they answer a business question.
- Use tables/lists for recent activity.
- Avoid decorative dashboard blocks.
- On mobile, prioritize urgent and daily-use information first.

---

# Vehicle Rental Domain UI

## Vehicle UI

Vehicle screens should prioritize:

- Plate number
- Make/model/year
- Current status
- Availability
- Current rental if any
- Maintenance history
- Expenses
- Documents/photos
- Mileage

## Customer UI

Customer screens should prioritize:

- Name
- Phone
- National ID
- License number
- Current rental if any
- Rental history
- Documents

## Rental UI

Rental screens should prioritize:

- Rental status
- Customer
- Vehicle
- Pickup date
- Expected return date
- Actual return date if available
- Total amount
- Paid amount
- Outstanding balance
- Contract actions
- Workflow actions

Important actions:

- Pick up
- Return
- Extend
- Cancel
- Record payment
- Generate/print contract

## Maintenance UI

Maintenance screens should prioritize:

- Vehicle
- Type
- Status
- Due date
- Completion date
- Vendor
- Cost
- Replaced parts
- Notes

## Financial UI

Financial screens should clearly distinguish:

- Revenue
- Payments
- Outstanding balances
- Expenses
- Maintenance costs
- Net profit

Do not mix financial concepts in a way that hides business meaning.

---

# Arabic UI Copy

The UI should use clear, concise Arabic.

## Tone

Use Arabic that is:

- Professional
- Direct
- Practical
- Calm
- Business-like

Avoid:

- Marketing slogans
- Overly formal phrases
- Casual slang
- Machine-translation style
- Exclamation marks
- Long button labels

## Standard Module Labels

Use:

- لوحة التحكم
- المركبات
- العملاء
- الإيجارات
- الصيانة
- المصاريف
- المدفوعات
- المهام
- التحليلات
- التقارير
- الإعدادات

## Standard Actions

Use:

- حفظ
- إلغاء
- تعديل
- حذف
- أرشفة
- إضافة
- بحث
- تصفية
- طباعة
- تصدير
- تسجيل دفعة
- إضافة مركبة
- إضافة عميل
- إنشاء إيجار
- إرجاع المركبة
- تمديد الإيجار
- إكمال الصيانة

---

# Accessibility

The UI must remain accessible.

Requirements:

- Visible focus states
- Keyboard navigation
- Clear labels
- Readable contrast
- Semantic HTML
- Touch-friendly controls
- Proper form errors
- Reduced-motion support
- No color-only status communication

Accessibility is required, not optional.

---

# Motion

Motion should be minimal and useful.

Allowed:

- Subtle hover transitions
- Active/pressed feedback
- Loading skeletons
- Small transitions between states
- Reduced-motion-safe animations

Avoid:

- Heavy animated backgrounds
- Cursor effects
- 3D effects
- Flashy landing-page motion
- Decorative animations that slow workflow

Motion should make the product feel responsive, not distracting.

---

# Iconography

Icons should support recognition.

Rules:

- Use a consistent icon set.
- Use consistent icon size.
- Use consistent stroke width.
- Do not rely on icons without labels in primary navigation unless space requires it.
- Keep directional icons RTL-safe.
- Avoid cliché or decorative icons where text is clearer.

---

# Implementation Rules

## Use Existing Stack

The UI rebuild must work with the existing frontend stack.

Do not migrate frameworks or styling systems unless explicitly approved.

## Reuse Before Creating

Before creating a new component:

1. Check if a reusable component already exists.
2. Check if a shadcn component exists.
3. Check if a product-level wrapper should be created.
4. Only create a new one-off component when justified.

## Product Components

Prefer product-level components such as:

- AppShell
- Sidebar
- PageHeader
- PageContainer
- SectionCard
- KpiCard
- DataTable
- StatusBadge
- EmptyState
- LoadingState
- ErrorState
- FormSection
- DetailPanel
- ActionBar
- FilterBar

## Avoid Visual Drift

Do not introduce:

- One-off colors
- One-off spacing
- One-off card styles
- One-off button styles
- One-off status colors
- Arbitrary z-index values
- Duplicate components
- New variants without repeated need

---

# Verification Checklist

Every rebuilt screen should be reviewed against this checklist.

## Product Fit

- Does it feel like a real SaaS product?
- Does it fit vehicle rental business operations?
- Does it avoid generic AI dashboard style?
- Does it avoid landing-page patterns?

## Layout

- Does desktop use space properly?
- Does mobile remain efficient?
- Does tablet layout work naturally?
- Is spacing consistent?
- Is the content width controlled?

## Components

- Are buttons consistent?
- Are cards consistent?
- Are tables readable?
- Are forms clear?
- Are badges consistent?
- Are empty/loading/error states present?

## Responsiveness

Check at:

- 375px
- 768px
- 1024px
- 1440px
- 1920px

Verify:

- No horizontal overflow
- No cramped content
- No stretched mobile layouts
- Primary actions remain visible
- Navigation works correctly

## Arabic RTL

- Is alignment correct?
- Are labels natural?
- Are actions clear?
- Are icons direction-safe?
- Does text fit the available space?

## Accessibility

- Is keyboard navigation usable?
- Are focus states visible?
- Is contrast readable?
- Are form errors clear?
- Are controls properly labeled?

---

# Definition of Done

The UI design system is successful when:

- Screens share a consistent visual language.
- Components are reusable and predictable.
- Desktop, tablet, and mobile layouts are intentionally designed.
- Arabic RTL is clean and professional.
- Future English/LTR support is not blocked.
- The UI feels like a sellable SaaS product.
- The design supports business workflows instead of decoration.
- Codex can use this document as the source of truth for UI rebuild implementation and review.

---

# Guiding Principle

Every UI decision should answer one question:

> Does this make the vehicle rental business easier to understand, manage, and operate while keeping the product professional, consistent, and production-ready?
