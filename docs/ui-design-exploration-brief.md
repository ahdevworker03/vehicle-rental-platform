# UI Design Exploration Brief

## Purpose

This brief defines the first design-exploration round for Milestone 5.5. Its purpose is to establish the reusable visual language and responsive layout rules before implementation begins.

The exploration must improve the current card-first prototype into practical vehicle-rental business software while preserving existing workflows, API behavior, and domain rules. It is for design review in Replit and Figma; it is not production-code or a screen-by-screen implementation specification.

## Design Direction

- **Product character:** clean, professional, modern operational SaaS—not a landing page, portfolio, generic admin template, or AI demo.
- **Brand:** blue/trust for identity, primary actions, selected states, and important links; neutral backgrounds and white surfaces; green, amber, red, and muted states only for their business meaning.
- **Information style:** dense where comparison supports decisions, quiet where supporting detail is secondary. Do not make the dashboard or records pages a pile of equal cards.
- **Language:** Arabic RTL first. Keep all layout decisions safe for a future Arabic/English product.
- **Responsive intent:** structurally adapt at 375, 768, 1024, 1440, and 1920px. Desktop must use the workspace; tablet must be a deliberate middle state; mobile must preserve fast operational actions.
- **Visual restraint:** no gradients, glass effects, oversized marketing headings, decorative illustrations, excessive shadows, or motion that does not support a task.

## What We Are Designing First

Explore one coherent foundation, using these six connected screens/patterns:

1. **App shell** — complete navigation, top-level context, and responsive shell states.
2. **Dashboard** — operational hierarchy and reusable KPI/alert/summary patterns.
3. **Rentals data list** — the reference dense list, with desktop, tablet, and mobile variants.
4. **Rental detail** — the reference detail layout for actions, payment state, and related history.
5. **Create Rental form** — the reference multi-section form workflow.
6. **Analytics/report pattern** — the reference for decision-led insight and reporting context.

These are deliberately connected: shell, action bar, status badge, data list, summary panel, form section, feedback state, and responsive rules should be reusable in later vehicle, customer, maintenance, expense, payment, and task screens.

## What We Are Not Designing Yet

- Complete visual designs for every business module or every empty/error edge case.
- New product features, statuses, calculations, business rules, API contracts, or data models.
- A final payment-information architecture decision.
- Marketing pages, customer portals, online booking, vehicle sales, dark mode, or future English screens.
- Production components, source-code changes, new dependencies, or final interaction implementation details.

## Source Findings From UI Audit

The exploration must directly solve these audit findings:

- Primary navigation currently exposes only five destinations, while Expenses, Tasks, Analytics, and Reports are implemented and Payments are only contextual inside rental detail.
- The desktop experience is a limited expansion of a mobile/card-first UI. Operational lists lack a dense comparison pattern, and the dashboard gives large, similar-weight cards too much prominence.
- Cards, borders, rounded corners, shadows, button styling, status badges, and feedback states have drifted between screens instead of forming a governed component system.
- Dashboard business content is appropriate, but urgent returns, balances, maintenance, and tasks need a clearer action-first hierarchy than revenue/context cards.
- Tablet has no distinct navigation/layout state between bottom navigation and the full desktop sidebar.
- Custom focus, label association, loading, error, and RTL/LTR safety require a shared baseline rather than page-specific fixes.
- Arabic copy is generally practical, but core terms must be standardized across navigation, actions, statuses, tables, and reports.

## App Shell Brief

### Desktop: 1024px and above

- Use a persistent, full RTL sidebar that gives access to the approved primary modules in business-workflow order:
  - لوحة التحكم
  - المركبات
  - العملاء
  - الإيجارات
  - الصيانة
  - المصاريف
  - المدفوعات or a clearly labelled finance review destination when approved
  - المهام
  - التحليلات
  - التقارير
  - الإعدادات when it exists
- Group navigation visually only where grouping helps scanability; do not hide key operations behind generic “more” menus on desktop.
- Make the current location unmistakable using label, color, and surface treatment—not icon color alone.
- Provide a compact topbar/page context area for organization identity, page title/context, global or page-level search where appropriate, and account/session actions. It must not compete with the page’s primary action.
- Use a responsive workspace container: wide enough for dashboard, reports, and tables; constrained for forms; structured for detail pages. Avoid edge-to-edge text and narrow mobile columns floating inside a large desktop canvas.

### Tablet: 768px to 1023px

- Establish a distinct middle state. Preferred exploration: a compact sidebar or navigation drawer with clear module labels, paired with a page topbar.
- Keep primary actions visible and make filters/search easy to reach without squeezing content beside a full desktop sidebar.
- Use two-column content only when each column remains readable; table/list layouts may use reduced columns or a hybrid row design.

### Mobile: 375px to 767px

- Use compact persistent navigation for the highest-frequency destinations plus a clearly discoverable module switcher/drawer for the complete module set.
- Keep the page title and one primary action near the top. Move secondary actions and dense filters into a sheet/drawer when that improves scanability.
- Maintain bottom-safe content spacing and touch targets; do not turn every operation into a multi-tap navigation chain.

### Payment decision placeholder

> Payment entry remains rental-contextual, but organization-wide payment review may need a discoverable finance/reporting surface.

Explore how a finance/review destination could expose payment collection and outstanding balances without assuming a separate payment-entry workflow or changing existing domain behavior. The final information-architecture decision remains open.

### Direction safety

- Design navigation, panels, breadcrumbs/back affordances, pagination, icons, and numeric columns using logical start/end behavior.
- Do not depend on hard-coded left/right placement. Document which directional icons should flip in future LTR and which must not.

## Dashboard Brief

The dashboard should answer, within a few seconds: **What needs attention now? What is happening with the fleet and rentals? What is the financial state? Where should I act next?**

### Recommended hierarchy

1. **Urgent operational alerts** — overdue returns, returns due today/soon, maintenance overdue, overdue tasks, and high-impact outstanding balances. These should be scannable and actionable, not decorative alerts.
2. **Active rental and return activity** — active rentals, upcoming returns, and a direct route to the rental work queue.
3. **Fleet status** — available, reserved, rented, in maintenance, and out-of-service states with useful counts and a route to filtered fleet views.
4. **Financial summary** — revenue, expenses, net profit, and outstanding balance using one explicit time period and currency context.
5. **Maintenance and task reminders** — operational queues, ranked by due/overdue state.
6. **Recent activity** — compact, readable records that explain what changed and link to the relevant entity.
7. **Analytics/report shortcuts** — quiet secondary routes for deeper investigation, not large promotional panels.

### Layout exploration

- At desktop, use a purposeful grid: a compact KPI/alert band, a main operational area, and supporting financial/fleet/queue sections. Use a larger panel only when it carries a comparably large decision value.
- At tablet, preserve alert and active-rental priority while collapsing secondary summaries into a balanced two-column/stacked sequence.
- At mobile, lead with urgent alerts, active rentals/returns, fleet state, and one concise financial summary; defer deep analysis below the operational queue.
- Define a single KPI pattern with label, meaningful period/context, value, optional comparison, and a clear click-through destination. Do not repeat unrelated cards with identical visual weight.

## Data-List Page Brief

Use **Rentals** as the reference data-list page. It represents the primary operational workflow and establishes patterns later reused by vehicles, customers, maintenance, expenses, payments, tasks, and reports.

### Page structure

1. Page header with title, concise contextual description if useful, and a visible **إنشاء إيجار** action.
2. Search and filters in a single responsive work area: search by customer/vehicle/reference, status filters, date/return-urgency filters, and secondary filters without overwhelming the page.
3. Summary chips or compact counts only when they assist triage; do not duplicate dashboard KPIs.
4. Responsive rental data list.
5. Specific empty, loading, and error states.

### Priority rental fields

- Status
- Customer
- Vehicle
- Pickup date
- Expected return date
- Return urgency: overdue, today, upcoming, or normal
- Total amount
- Paid amount and outstanding balance
- One primary workflow action appropriate to status

### Responsive list behavior

- **Desktop:** a dense, accessible table/list with predictable columns, right-aligned monetary values, text status plus color, row-level drill-in, and a visible primary action. Use overflow menus only for genuinely secondary actions.
- **Tablet:** a hybrid list with the most important columns retained and secondary detail grouped inside each row or a detail preview.
- **Mobile:** structured cards/rows—not miniature tables. Place status, customer/vehicle identity, expected return/urgency, balance, and primary action in the first scan line; move secondary information below it.

### State requirements

- **Empty:** state that no rentals match or exist, explain the next useful action, and provide the creation action where allowed.
- **Loading:** use table- or row-shaped skeletons that preserve the final list structure.
- **Error:** identify the failed operation and offer a meaningful retry/recovery action.

## Detail Page Brief

Use **Rental Detail** as the reference detail pattern. It must support workflow decisions, not resemble a generic profile page.

### Information hierarchy

1. Rental status and return urgency.
2. Customer and vehicle identity, with fast navigation to their detail pages.
3. Pickup and expected/actual return dates.
4. Payment summary: total, paid, outstanding balance, and payment state.
5. Contract actions.
6. Status-appropriate workflow actions: pick up, return, extend, cancel, or record payment.
7. Payment history and related activity/history.

### Layout exploration

- **Desktop:** a main content column for the rental record, history, and related records; a secondary summary/action panel that remains visible while reviewing the record when practical. Primary actions should be visible without making the panel visually dominant.
- **Tablet:** preserve a concise summary/action area near the top, then allow sections to stack or move to a balanced two-column layout.
- **Mobile:** stack the status, customer/vehicle, date, balance, and primary action near the top; place payment history, contract, and activity below in clear sections.
- Use tabs only when sections are genuine peers and navigation reduces cognitive load. A vertical layout is preferred when users should scan sections in a natural sequence.

### Action safety

- Give destructive/cancelling actions lower visual priority and an explicit confirmation state.
- Surface blocked/unavailable actions with a clear reason rather than silently hiding core workflow context.
- Keep payment entry contextual to the rental while making the outstanding balance clear before the action.

## Form Pattern Brief

Use **Create Rental** as the reference form, because it contains the core customer, vehicle, schedule, amount, payment, availability, and contract-adjacent decisions.

### Form structure

- Use full-page or side-panel form space, never a large scrolling dialog.
- Group fields into clear sections, for example: customer, vehicle and availability, rental period, pricing/payment, and notes/contract context. The exploration must preserve existing business behavior rather than inventing fields or rules.
- Show a concise section purpose and only essential helper text. Avoid explanatory paragraphs that turn the form into documentation.
- Present availability or conflict feedback close to vehicle/date fields and explain what the user can do next.

### Responsive behavior

- **Desktop:** use a constrained readable form width with two columns only for related fields; use a persistent or clearly anchored save/cancel action area for long forms.
- **Tablet:** retain related two-column pairs only where they remain readable; otherwise stack the section without changing order or meaning.
- **Mobile:** one field per row, easy-to-reach primary save action, and a compact secondary cancel/back action.

### Validation and states

- Associate every visible label with its field and show required state consistently.
- Put validation immediately beside the relevant field, use specific Arabic messages, and preserve entered values after a failure.
- Define default, focus, invalid, disabled, and submitting states for every control.
- During submission, prevent accidental double action, retain form context, and give calm success/failure feedback.

## Analytics / Reports Pattern Brief

Explore one pattern that combines a decision-led analytics overview with a report workspace. The pattern should not be a collection of decorative charts or disconnected summary cards.

### Business questions to organize around

- How is revenue performing for the selected period?
- How much is outstanding and where is collection risk concentrated?
- Which vehicles generate the most revenue or profit?
- Which vehicles cost the most to maintain?
- Are revenue, expense, and net-profit trends improving or declining?

### Pattern structure

1. Clear title and selected period/context.
2. Compact report/analytics controls: period, comparison, and relevant filters.
3. Headline financial summary that makes revenue, expenses, net profit, maintenance cost, and outstanding balance distinguishable.
4. One chart or ranked list per business question, with a direct supporting interpretation/next action.
5. Detail table/list for investigation and print/export actions placed with the report context rather than scattered across the page.
6. Empty and error states that explain whether a selected period has no data or data could not be loaded.

### Chart rules

- Use charts only for a comparison or trend users can act on.
- Always provide a clear period, legend, accessible summary/value, and adjacent supporting table/list where precise values matter.
- Prefer ranked lists and compact tables over charts when a user needs to identify one vehicle, rental, or balance quickly.

## Responsive Requirements

| Viewport | Required exploration outcome |
| --- | --- |
| 375px | Single-column operational flow; compact complete navigation; visible primary action; mobile list cards; no compressed tables or horizontal overflow. |
| 768px | Intentional tablet navigation; balanced two-column areas where useful; hybrid data list; filters remain usable; forms do not feel cramped. |
| 1024px | Full workspace begins; sidebar/content balance works; desktop list/table and dashboard grids become useful; detail panels are structured. |
| 1440px | Full desktop shell; dense dashboard, data lists, reports, and multi-column details use width purposefully; forms remain constrained. |
| 1920px | Controlled wide workspace with no stretched cards, blank expanses, or edge-to-edge text; grids remain intentional and secondary panels add value. |

For every frame and pattern, verify:

- No horizontal overflow or clipped Arabic text.
- Primary action remains visible and distinguishable.
- Navigation remains reachable.
- Cards do not become unnecessarily wide.
- Numeric columns, balances, filters, forms, tables, sheets, and status badges remain readable.
- Important functionality is restructured, not hidden, at smaller widths.

## Arabic RTL Requirements

- Use concise professional Arabic for operational software. Preferred navigation terms include: لوحة التحكم، المركبات، العملاء، الإيجارات، الصيانة، المصاريف، المدفوعات، المهام، التحليلات، التقارير، الإعدادات.
- Use direct action labels such as: إضافة مركبة، إنشاء إيجار، تسجيل دفعة، إرجاع المركبة، تمديد الإيجار، إكمال الصيانة، حفظ، إلغاء, and تصدير.
- Use a consistent status glossary. Status must be communicated by short text and color, never color alone.
- Use scan-friendly headings and table headers: العميل، المركبة، الحالة، تاريخ الاستلام، تاريخ الإرجاع، المبلغ، الرصيد، الإجراءات.
- Keep currency, numbers, dates, icons, chevrons, alignment, and column order intentionally readable in RTL. Document their LTR counterpart rather than mirroring by accident.
- Avoid marketing claims, exclamation marks, machine-translated phrasing, and long button labels.

## Accessibility Requirements

- Every control must have a visible keyboard focus indicator, semantic role, accessible name, and predictable tab order.
- Every input requires a programmatically associated label; helper and error text must be associated with the relevant field.
- Status, urgency, and validation must not depend on color alone; provide text/icon support where needed.
- Define contrast-safe colors for primary, muted, status, disabled, and error content.
- Use touch targets appropriate for mobile and avoid tightly packed row actions or filter chips.
- Dialogs and sheets must have titles, initial focus, escape/close behavior, and logical focus return. Complex forms stay on a page or side panel.
- Charts need text summaries or corresponding data lists; do not make a chart the only way to understand business performance.

## Replit Exploration Instructions

Use the following as a visual-concept prompt. Replit output is for comparison and review only; do not generate production code, APIs, data models, or new features.

```text
Create visual concepts only for an Arabic RTL vehicle-rental operations SaaS. The product is for rental-office owners and employees, not consumers.

Design a clean, professional, modern business dashboard using a blue/trust palette, neutral backgrounds, restrained white surfaces, meaningful status colors, Cairo-style Arabic typography, and clear data density. It must feel like operational software, not a landing page, generic admin template, portfolio, or AI-generated demo.

Explore one coherent responsive system for: a full desktop sidebar and topbar; compact tablet navigation; mobile navigation with access to all key modules; a dense action-first dashboard; a Rentals list with a desktop table, tablet hybrid rows, and mobile structured cards; a Rental Detail page with a main content area and a desktop summary/action panel; a grouped Create Rental form; and an analytics/report workspace organized around revenue, outstanding balances, vehicle profitability, maintenance cost, and monthly trends.

Prioritize urgent returns, active rentals, fleet status, financial summary, outstanding balance, maintenance/tasks, and recent activity. Use concise Arabic business labels. Show status as label plus color. Include empty, loading, and error-state concepts.

Do not use hero sections, marketing slogans, gradients, glassmorphism, decorative charts, oversized cards, excessive shadows, or flashy animation. Do not invent booking, sales, customer portal, or backend behavior.
```

## Figma Exploration Instructions

Use the following as a design-review prompt. Figma frames are review artifacts, not final production code.

```text
Create reviewed Arabic RTL design frames for a vehicle-rental operations SaaS at 1440 desktop, 768 tablet, and 375 mobile.

Create frames for: (1) app shell and complete primary navigation, (2) dashboard, (3) Rentals data list, (4) Rental Detail, (5) Create Rental form pattern, and (6) analytics/report pattern.

Use a clean professional modern SaaS direction: blue/trust primary color, neutral surfaces, restrained elevation, readable Arabic type, practical business labels, and semantic status colors. The desktop sidebar must expose Dashboard, Vehicles, Customers, Rentals, Maintenance, Expenses, a discoverable finance/payment-review placeholder, Tasks, Analytics, Reports, and Settings when present. Payment entry remains rental-contextual; do not invent a final standalone payment-entry module.

The dashboard must lead with urgent operational alerts, active rentals/upcoming returns, fleet status, financial summary, outstanding balances, maintenance/task reminders, recent activity, and quiet analytics/report shortcuts. The Rentals list must show status, customer, vehicle, pickup date, expected return, urgency, total, paid/outstanding balance, and primary action. The detail page must make workflow actions, payment summary, contract actions, history, and related activity clear. The form must be grouped, accessible, responsive, and full-page/side-panel—not a large dialog.

Show responsive adaptation rather than scaled copies: desktop table, tablet hybrid, mobile cards; desktop summary rail, mobile stacked detail; compact complete mobile navigation; explicit empty/loading/error concepts. Avoid landing-page heroes, marketing copy, gradients, glass effects, decorative charts, excessive cards, and flashy motion.
```

## Codex Implementation Notes For Later

- Treat approved Figma direction as a visual and interaction reference, then implement it inside the existing React, Tailwind, shadcn, routing, form, and API-client architecture.
- Preserve existing routes, API contracts, domain statuses, financial calculations, authorization, and rental workflows unless a separate approved product decision changes them.
- Build shared shell/layout and product components before rebuilding individual business pages. Prefer shared components over one-off page classes.
- Implement the responsive behavior described in the approved frames for all target widths; do not merely shrink desktop layouts or stretch mobile cards.
- Use the existing design-token approach and accessible shadcn/Radix primitives where they fit. Do not introduce libraries or components without a demonstrated reusable need.
- Complete visual, RTL, keyboard, loading/error, and responsive QA after each phase, with the audit findings as the acceptance baseline.

## Approval Checklist

- [ ] The concepts feel like Arabic RTL vehicle-rental business software, not a generic admin or marketing site.
- [ ] The app shell exposes all primary modules and includes a deliberate tablet and mobile navigation strategy.
- [ ] Payment entry remains rental-contextual and the organization-wide payment-review question is visibly marked as an open decision.
- [ ] The dashboard clearly prioritizes urgent operational work before secondary financial/history context.
- [ ] The Rentals list supports dense desktop comparison, a readable tablet hybrid, and structured mobile cards.
- [ ] Rental Detail makes status, dates, customer, vehicle, balance, contract, workflow actions, payments, and activity easy to scan.
- [ ] The form pattern groups related work, supports validation, and avoids long scrolling dialogs.
- [ ] Analytics/reports answer concrete business questions with meaningful periods, values, charts, and supporting detail.
- [ ] The 375, 768, 1024, 1440, and 1920px behaviors are explicitly represented or reviewed.
- [ ] Arabic terminology, RTL directionality, focus states, labels, contrast, touch targets, and chart alternatives meet the accessibility requirements.
- [ ] The concepts avoid equal-weight card piles, decorative effects, generic copy, and unsupported new features.
