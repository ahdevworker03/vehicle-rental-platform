# UI Design System

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [1. Purpose](#1-purpose) |
| 2 | [2. Product UI Principles](#2-product-ui-principles) |
| 3 | [3. Scope and Non-Goals](#3-scope-and-non-goals) |
| 4 | [Scope](#scope) |
| 5 | [Non-goals](#non-goals) |
| 6 | [4. Visual Direction](#4-visual-direction) |
| 7 | [5. Design Tokens](#5-design-tokens) |
| 8 | [5.1 Color](#51-color) |
| 9 | [5.2 Typography](#52-typography) |
| 10 | [5.3 Spacing](#53-spacing) |
| 11 | [5.4 Radius, Borders, and Shadows](#54-radius-borders-and-shadows) |
| 12 | [5.5 Status Semantics](#55-status-semantics) |
| 13 | [6. Responsive Layout System](#6-responsive-layout-system) |
| 14 | [7. App Shell and Navigation](#7-app-shell-and-navigation) |
| 15 | [Desktop and Tablet](#desktop-and-tablet) |
| 16 | [Mobile](#mobile) |
| 17 | [Boundary Rules](#boundary-rules) |
| 18 | [8. Page Archetypes](#8-page-archetypes) |
| 19 | [8.1 Dashboard](#81-dashboard) |
| 20 | [8.2 List Pages](#82-list-pages) |
| 21 | [8.3 Detail Pages](#83-detail-pages) |
| 22 | [8.4 Forms and Create/Edit Flows](#84-forms-and-createedit-flows) |
| 23 | [8.5 Reports and Analytics](#85-reports-and-analytics) |
| 24 | [8.6 Account and Auth Flows](#86-account-and-auth-flows) |
| 25 | [9. Core Components](#9-core-components) |
| 26 | [9.1 Buttons and Actions](#91-buttons-and-actions) |
| 27 | [9.2 Cards](#92-cards) |
| 28 | [9.3 Tables and Mobile Cards](#93-tables-and-mobile-cards) |
| 29 | [9.4 Forms](#94-forms) |
| 30 | [9.5 Status Badges](#95-status-badges) |
| 31 | [9.6 Dialogs and Sheets](#96-dialogs-and-sheets) |
| 32 | [9.7 Feedback States](#97-feedback-states) |
| 33 | [10. Arabic RTL Guidelines](#10-arabic-rtl-guidelines) |
| 34 | [11. Accessibility Requirements](#11-accessibility-requirements) |
| 35 | [12. Data and API State Rules](#12-data-and-api-state-rules) |
| 36 | [13. Motion and Interaction](#13-motion-and-interaction) |
| 37 | [14. Platform Admin Boundary](#14-platform-admin-boundary) |
| 38 | [15. Implementation Rules](#15-implementation-rules) |
| 39 | [16. Verification Checklist](#16-verification-checklist) |

## 1. Purpose

This document is the implementation baseline for the Vehicle Rental Management Platform UI. It translates the frontend audit and Milestone 5.5 direction into reusable rules for `apps/web`.

The product is an Arabic-first, RTL, operational SaaS application for vehicle rental businesses. The interface must help owners and employees complete daily work quickly and understand the current state of their fleet, rentals, finances, and obligations.

Use this document when designing, implementing, or reviewing user-facing frontend work. Current implementation, API contracts, and product documentation remain the sources of truth for behavior and domain rules.

## 2. Product UI Principles

- **Business first:** prioritize actions and information that prevent missed returns, unavailable vehicles, overdue balances, maintenance issues, or data-entry mistakes.
- **Operational clarity:** show the current status, the next valid action, and relevant amounts or dates before secondary detail.
- **Density with hierarchy:** use compact, scannable layouts for operational work without reducing readability or touch targets.
- **Consistency over novelty:** repeated workflows use shared page, list, detail, form, and feedback patterns.
- **Responsive by design:** adapt information architecture by device width; do not merely shrink desktop screens.
- **Calm professionalism:** use visual emphasis to communicate business importance, not decoration.

## 3. Scope and Non-Goals

### Scope

- Tenant-facing app shell, navigation, dashboard, business screens, operations, analytics, reports, authentication, account, and company workflows.
- Existing and approved Version 2 UI support for organization profile, organization status, invitations, password reset, document expiry, recurring tasks, and maintenance schedules.
- Shared components, responsive behavior, Arabic RTL, accessibility, and API-state presentation.

### Non-goals

- This is not a greenfield rewrite. Preserve existing business behavior, routes, generated API integration, and domain workflows unless a verified usability or integration problem requires a change.
- Do not introduce billing, subscriptions, usage metering, Whish/QR payments, support CRM, tenant impersonation, notification delivery, background schedulers, or maintenance automation.
- Do not build the platform-admin dashboard as part of the tenant-facing rebuild.
- Do not invent persisted statuses, permissions, calculations, or API behavior in the UI.

## 4. Visual Direction

Use a clean, professional, modern SaaS dashboard style.

- Primary direction: blue for trust and primary actions; neutral backgrounds; white surfaces; clear semantic status colors; low visual noise.
- The application is a work tool, not a landing page, portfolio, generic admin template, or animated demo.
- Prefer subtle borders, restrained shadows, readable type, and intentional whitespace.
- Avoid decorative gradients, deep card nesting, oversized headings, excessive rounding, and non-functional illustration.
- Use icons to support recognition. Do not replace a primary navigation or business action label with an icon alone.

## 5. Design Tokens

Current tokens are defined in `apps/web/src/index.css`. Reuse semantic roles before adding a token or component-specific color.

### 5.1 Color

| Role | Current semantic token family | Usage |
|---|---|---|
| App background and text | `background`, `foreground` | Page canvas and primary text |
| Surfaces | `card`, `popover`, `muted` | Sections, overlays, subdued areas |
| Structure | `border`, `input` | Dividers, fields, table structure |
| Brand/action | `primary`, `secondary`, `accent`, `ring` | Primary actions, selected state, focus |
| Destructive | `destructive` | Delete, irreversible or blocking actions |
| Navigation | `sidebar` family | Desktop/sidebar navigation |
| Status | `status-positive`, `status-info`, `status-warning`, `status-danger`, `status-neutral` | Business state and contextual feedback |

Rules:

- Blue identifies primary action, selected navigation, important links, and focused work. It must not decorate every icon, heading, or card.
- Neutrals provide most surfaces, structure, muted text, disabled treatment, and table rhythm.
- Use existing semantic tokens; compatibility aliases are transitional and new UI should use the semantic status family.
- Never encode critical meaning through color alone.

### 5.2 Typography

- Use the existing Arabic-capable `--app-font-sans` stack. Any font change needs a clear Arabic readability reason.
- Use the existing semantic hierarchy: page title, section title, label, secondary text, KPI value, table text, button text, and badge text.
- Page titles are compact product headings, not marketing headings. Section titles distinguish work groups; helper text explains state or constraints.
- Use medium or semibold weight for hierarchy. Keep body, table, and helper text readable at compact operational density.
- Render amounts, dates, identifiers, plate numbers, phone numbers, and KPI values with the existing LTR numeric treatment where needed inside RTL content.
- Display user-facing dates as `dd/mm/yyyy` (for example, `31/08/2026`). Datetime values use the same date format with Beirut-local time.

### 5.3 Spacing

Use the existing four-pixel base scale and keep spacing intentional.

| Context | Rule |
|---|---|
| Page gutters | One shell/container owner; avoid duplicate page and child padding |
| Page sections | Use a consistent vertical rhythm; compact on mobile, roomier on desktop |
| Cards and panels | Shared padding for equivalent card types; no empty oversized surfaces |
| Forms | Stable field and section gaps; related fields are grouped |
| Tables and lists | Row height supports scanning and touch use without waste |
| Actions | Group related actions; separate destructive actions from routine actions |

Do not add arbitrary one-off padding, margins, or widths when an existing token or layout primitive fits.

### 5.4 Radius, Borders, and Shadows

- Use the existing small, medium, large, and extra-large radius scale. Controls use smaller radii than cards and panels.
- Borders provide most separation. Shadows are subtle and reserved for raised surfaces, menus, dialogs, and contextual emphasis.
- Avoid a border, shadow, and white card around every content fragment.
- Avoid arbitrary z-index values; use established layer conventions for shell, popover, dialog, and toast behavior.

### 5.5 Status Semantics

Every status display uses a short text label plus semantic color and, when useful, an icon.

| Meaning | Semantic treatment | Typical use |
|---|---|---|
| Positive / available / completed | Positive | Available vehicle, paid/complete state |
| Active / informational | Info | Active rental, selected or informational state |
| Scheduled / needs attention | Warning | Maintenance, due soon, pending balance |
| Overdue / blocking / destructive | Danger | Overdue return, failed action, destructive confirmation |
| Archived / cancelled / unavailable | Neutral | Archived vehicle, cancelled or inactive state |

- Map persisted statuses through the domain label source; do not create new statuses solely for presentation.
- Derived states such as overdue or due today may supplement, not replace, the persisted state.
- Keep the same label and treatment for the same meaning across dashboard, lists, details, and forms.

## 6. Responsive Layout System

The locked review widths are 375px, 768px, 1024px, 1440px, and 1920px. Test real Arabic strings and real data states at each width.

| Width | Layout rule |
|---|---|
| 375px | Single column, compact controls, bottom navigation, visible primary action, no unintended horizontal overflow |
| 768px | Adaptive navigation/rail, balanced gutters, selective two-column sections, preserved touch targets |
| 1024px | Desktop shell transition, stable sidebar/content balance, useful two-column details and forms |
| 1440px | Bounded, information-dense dashboard and tables with intentional columns |
| 1920px | Controlled max widths and grids; use space for useful data, not stretched rows or empty canvas |

- Content widths vary by page type: forms are constrained, list/report pages can be wide, and dashboards/details use deliberate grids.
- Tables must become mobile cards, prioritized fields, or justified horizontal scroll. Never shrink columns until text is unreadable.
- Full-screen task flows may omit persistent mobile navigation only when they need focused completion and provide a clear back/cancel route.

## 7. App Shell and Navigation

Define one responsive shell contract. The current shell already provides a skip link, desktop sidebar, tablet rail, mobile bottom navigation, and a scrollable main content region; rebuild work must preserve those responsibilities.

### Desktop and Tablet

- Desktop uses a full sidebar grouped by business workflow: rental management, daily operations, and business follow-up.
- Tablet uses the approved adaptive rail or equivalent compact navigation without duplicating conflicting active, focus, or spacing behavior.
- Keep active routes obvious and navigation labels stable. Route order follows daily workflow priority.
- Include an account/company area for owner-facing profile, organization settings, employee invitations, and session actions.

### Mobile

- Keep a small set of frequent destinations immediately available: dashboard, rentals, vehicles, and customers.
- A clear More navigation exposes maintenance, expenses, tasks, analytics, reports, and account/company destinations. It must preserve route context and be keyboard accessible.
- Do not hide a primary workflow behind an unlabeled icon or require desktop navigation for routine work.

### Boundary Rules

- Payments remain rental-contextual unless a product-approved organization-wide payments route exists.
- Platform-only controls do not appear in standard tenant navigation.
- Suspended or cancelled organizations retain the account-status path while business actions are visibly unavailable according to authorization behavior.

## 8. Page Archetypes

All pages use the sequence that fits their workflow: page header, primary action, search/filter controls when relevant, main content, secondary/related content, then state feedback.

### 8.1 Dashboard

- The first viewport prioritizes revenue-loss and operational-risk information: overdue returns, returns due today, outstanding balances, fleet availability, urgent maintenance, overdue tasks, and urgent document expiry.
- Follow with active rentals, financial summary, fleet status, maintenance/tasks, recent activity, and shortcuts to deeper analysis.
- Financial periods must be explicit. Never present a fixed or mock period as current business data.
- Separate `loading`, `unavailable`, `zero`, and `error` states. A zero value is valid data; unavailable data is not.
- Charts are optional and must answer a defined business question. Lists or tables are preferred for actionable recent activity.

### 8.2 List Pages

- Support search, filters, sort, and pagination or a clear equivalent appropriate to the available API/data behavior.
- Persist or make recoverable the user’s list context when navigating to detail and back.
- Desktop may use dense tables or structured lists. Mobile uses cards or prioritized fields.
- Keep row actions predictable: primary navigation opens detail; secondary/destructive actions are grouped and confirmed when necessary.
- State the search scope where it is not obvious, particularly for customer, vehicle, and rental lookup.

### 8.3 Detail Pages

Lead with:

1. Entity identity and persisted status.
2. The next valid action.
3. Financial or operational summary.
4. Related records and secondary metadata.

- Vehicle detail prioritizes availability, current rental, maintenance, mileage, documents, and photos.
- Customer detail prioritizes active rental, outstanding balance, license validity, documents, and rental history.
- Rental detail keeps total, deposit, paid amount, outstanding balance, contract state, and status-dependent actions visible. Contract generation and signature status are distinct.
- Maintenance, task, and expense detail retains status, due/completion information, vehicle association, financial value, and notes before secondary metadata. Task Detail uses the task title as its identity and presents notes as secondary content.

### 8.4 Forms and Create/Edit Flows

- Use a shared label, input, hint, validation, submit, and cancel pattern.
- Associate every label, hint, and error with its control. Invalid controls expose `aria-invalid` and error/help relationships.
- Group related fields. Use one column on mobile and a purposeful two-column layout on wider screens.
- Keep the primary submit action stable and obvious. Disable duplicate submissions and show submitting state.
- Use full pages or sheets for complex workflows; avoid modals for large, multi-section forms.
- Confirmation is required for destructive, status-changing, or financially significant actions. The confirmation states the consequence and action target.
- For supported Version 2 flows, reuse this pattern for registration, password reset, invitation acceptance, organization profile, document-expiry editing, recurring task settings, and maintenance schedule management.
- Recurring task controls stay simple: interval plus day/week/month unit, with never, date, or occurrence-count end conditions. Do not expose cron, weekday rules, or other complex recurrence syntax.
- Task create/edit forms place `اسم المهمة`, `تاريخ الاستحقاق`, `ملاحظات`, then recurrence controls in that order. The title is required primary identity; notes are optional supplementary content.

### 8.5 Reports and Analytics

- Make the reporting period, source scope, and included records clear.
- Distinguish printable rental contracts from business reports.
- Support loading, empty, export/print failure, and retry states.
- Charts require a readable textual or tabular summary and a compact mobile alternative.

### 8.6 Account and Auth Flows

- Public flows include login, registration, password-reset request/confirmation, and invitation acceptance when implemented against existing contracts.
- Auth screens are focused, low-distraction forms with clear validation, loading, recovery, and redirect behavior.
- Owner account/company screens expose organization profile and employee invitation workflows without exposing platform controls.
- Suspended/cancelled state is an account-level explanation with permitted recovery/support actions; it is not a generic application error.

## 9. Core Components

### 9.1 Buttons and Actions

- Use primary, secondary/outline, ghost, destructive, disabled, and loading treatments already supported by the component foundation.
- One primary action per visual area unless a workflow clearly requires more. Destructive actions are visually distinct.
- Buttons expose hover, pressed, focus-visible, disabled, and loading states. Icon-only buttons have an accessible name and adequate target size.
- Use concise Arabic action labels such as `حفظ`, `إلغاء`, `تعديل`, `حذف`, `إضافة`, `بحث`, `تصفية`, `طباعة`, and `تصدير`.

### 9.2 Cards

- Use cards for KPI metrics, dashboard blocks, entity summaries, alerts, and related-record groups.
- Equivalent cards share padding, title treatment, density, and action placement.
- Cards should clarify grouping, not wrap every text fragment or create nested visual boxes.

### 9.3 Tables and Mobile Cards

- Tables are suitable for rentals, customers, expenses, maintenance history, tasks, reports, and other comparable records.
- Align numeric values consistently and preserve LTR formatting for numbers in RTL contexts.
- Provide table-shaped loading states, useful empty states, and explicit action affordances.
- On mobile, retain the most decision-relevant fields and move secondary information into detail rather than compressing every column.

### 9.4 Forms

- Inputs use the established control height, border, focus, disabled, placeholder, and error treatment.
- Hints explain constraints before failure; inline errors explain how to recover.
- Required markers supplement labels and validation; they do not replace clear field instructions.
- Date, time, amount, phone, plate, and identifier fields preserve readable direction and input behavior in RTL layouts.
- Business date and time interpretation uses `Asia/Beirut`; do not apply fixed UTC+2 or UTC+3 offsets. Genuine date-only fields must not be timezone-shifted.

### 9.5 Status Badges

- Status badges are compact labels, not decorative pills.
- Use them for vehicle, rental, maintenance, task, payment/balance, document expiry, and organization lifecycle states.
- Do not overload a row with badges; choose persisted status first, then the most urgent derived state when it changes the required action.

### 9.6 Dialogs and Sheets

- Dialogs are for confirmation, short focused tasks, and contextual decisions.
- Sheets can host focused create/edit content or related context when a full route would interrupt a list workflow.
- On open, move focus into the component; trap focus as appropriate; support Escape; return focus to the trigger; and prevent interaction with background content.
- Provide a labeled close action. Do not rely on backdrop click as the only way to dismiss a dialog or sheet.

### 9.7 Feedback States

| State | Required treatment |
|---|---|
| Loading | Layout-shaped skeleton or localized progress; retain shell/navigation and avoid layout shifts |
| Empty | Explain what is absent and offer the relevant next action when permitted |
| Zero | Present as valid, complete data; do not use an error or placeholder |
| Unavailable | Explain that the value cannot currently be determined without implying zero |
| Error | Calm Arabic message, recovery action where possible, no raw technical payload |
| Permission denied | Explain access limitation and provide an allowed next step if one exists |
| Submitting | Prevent duplicate action, retain context, and communicate progress |

## 10. Arabic RTL Guidelines

- Set document and component direction intentionally; use `start`/`end`, logical padding/margin, and direction-aware icon placement rather than physical `left`/`right` utilities.
- Test the actual Arabic labels and realistic names, addresses, notes, and status text at every responsive target.
- Keep product copy concise, professional, direct, and calm. Avoid slogans, casual slang, machine translation, and unnecessary exclamation marks.
- Use `dir="auto"` or equivalent for mixed-direction values when appropriate. Numbers, dates, plates, phone numbers, money, and identifiers must remain legible.
- Directional icons represent the intended reading/action direction. Do not mirror non-directional semantic icons.

## 11. Accessibility Requirements

- Use semantic HTML and native controls before ARIA additions.
- Maintain visible focus states and logical keyboard order. Provide a skip link to main content.
- Meet readable contrast for text, controls, focus indicators, and semantic status colors.
- Every control has an accessible name. Icon-only controls require explicit labels.
- Form controls link labels, instructions, and validation errors programmatically.
- Status text, not color alone, communicates state. Do not use color-only charts or alerts.
- Dialogs, sheets, menus, and mobile More navigation must meet focus, Escape, dismissal, and return-focus rules.
- Touch targets remain usable on mobile. Respect reduced-motion preferences.
- Critical rental, return, payment, maintenance, and auth flows require keyboard-only and screen-reader verification.

## 12. Data and API State Rules

- A screen presents one authoritative data source for each user-visible entity or metric. Do not mix local/mock and API-backed records in a way that can produce conflicting names, counts, statuses, or financial values.
- Preserve API contract meanings. The UI can format and group data but must not infer unsupported permissions, lifecycle transitions, financial calculations, or automation.
- Loading, unavailable, zero, stale/refreshing, and error values are distinct visual states. Financial values must never silently fall back to zero on an error.
- Filter, sort, pagination, search, and route state should be reflected clearly enough for users to understand the current result set.
- API errors are mapped to concise Arabic recovery messages. Technical diagnostics remain in developer tooling, not user-facing screens.
- Mutation feedback confirms the result and refreshes or reconciles the visible source of truth before showing a completed state.

## 13. Motion and Interaction

- Motion is brief, functional, and optional: hover/pressed feedback, small state transitions, skeleton loading, and menu/sheet/dialog transitions.
- Avoid animated backgrounds, cursor effects, 3D effects, large entrance animations, and motion that delays operational work.
- Use hover only as enhancement; active, focus, labels, and persistent state must work on touch and keyboard.
- Respect reduced-motion preferences and never make essential information dependent on animation.

## 14. Platform Admin Boundary

- Tenant-facing screens serve organization owners and employees. Platform-only lifecycle controls and audit information must not appear in normal tenant navigation or settings.
- The tenant rebuild may reserve a clean `PLATFORM_OWNER` entry point if authorization requires it, but a simple Platform Admin Dashboard belongs to Milestone 6.
- A limited audit-log view may be planned separately for platform-owner scope. It is not part of the tenant-facing design-system implementation.
- Do not use this boundary to add billing, support, impersonation, or other unapproved administrative products.

## 15. Implementation Rules

- Preserve the existing React, Wouter, Tailwind, shadcn-style primitive, and generated API-client foundations unless an approved change requires otherwise.
- Reuse existing `AppShell`, navigation, `PageContainer`, `PageHeader`, `SectionCard`, `StatusBadge`, form, and feedback primitives before creating replacements.
- Create a product-level component only when a repeated domain pattern needs a stable API. Avoid one-off wrappers and duplicate variants.
- New UI must use semantic tokens, logical RTL-safe utilities, existing formatting helpers, and generated API hooks/contracts where applicable.
- Do not begin screen-specific rebuild work until the relevant shared layout/component pattern is approved.
- Preserve existing test, typecheck, lint, and build expectations. Add tests with implementation work, not in this documentation-only step.

## 16. Verification Checklist

Before accepting a rebuilt screen, verify:

- It preserves approved business behavior and has one clear source of visible data.
- The primary action, current status, and next useful action are immediately understandable.
- Page, list, detail, form, and feedback patterns follow this document rather than introducing one-off styling.
- Financial period, data scope, loading, unavailable, zero, and error states are truthful and visually distinct.
- Arabic RTL alignment, mixed-direction values, labels, and directional icons work with real content.
- Desktop, tablet, and mobile behavior pass at 375px, 768px, 1024px, 1440px, and 1920px with no unintended overflow, cramped controls, or stretched content.
- Keyboard navigation, focus order, form error associations, dialogs/sheets, status labels, contrast, and reduced-motion behavior pass review.
- No platform-only controls or deferred features have leaked into tenant workflows.
- Relevant typecheck, lint, tests, production build, and manual visual review pass for the implementation phase.
