---
name: visual-qa-review
description: Reviews rebuilt UI screens for visual quality, product fit, responsiveness, consistency, accessibility, and generic AI design patterns before approval.
---

# Visual QA Review Skill

## How This Works

Use this skill after a screen or UI phase has been implemented.

Follow this sequence:

1. **Inspect the screen** — Review the actual rendered UI, not only the code.
2. **Compare against product direction** — Clean, professional, modern SaaS dashboard, blue/trust brand direction, Arabic-first RTL.
3. **Check visual quality** — Spacing, alignment, typography, hierarchy, color, density, and component consistency.
4. **Check responsiveness** — Verify target widths.
5. **Check usability** — Ensure the screen helps the business workflow.
6. **Report issues clearly** — Separate blockers, important fixes, and optional polish.

## Required Review Widths

Review at:

- 375px
- 768px
- 1024px
- 1440px
- 1920px

## Review Categories

### 1. Product Fit

Check:

- Does this look like a real SaaS product?
- Does this fit a vehicle rental business?
- Is it clean and professional?
- Does it avoid generic AI dashboard style?
- Does it avoid marketing-site patterns?

Fail if:

- It looks like a portfolio.
- It looks like a landing page.
- It uses flashy visual effects without purpose.
- It uses generic slogans instead of business labels.
- It hides business-critical information.

### 2. Information Hierarchy

Check:

- Is the most important information visible first?
- Are primary actions obvious?
- Are secondary actions visually lower priority?
- Are alerts and risky states easy to notice?
- Are sections ordered logically?

Fail if:

- Users must hunt for key actions.
- Metrics appear without meaning.
- All sections have equal visual weight.
- Important warnings blend into normal content.

### 3. Layout and Spacing

Check:

- Page spacing is consistent.
- Sections align correctly.
- Cards have balanced padding.
- Tables have readable density.
- Forms use available width properly.
- Desktop does not feel like stretched mobile.
- Mobile does not feel cramped.

Fail if:

- There is awkward empty desktop space.
- Cards are too large for their content.
- Columns are misaligned.
- Similar sections use different spacing.
- Text wraps badly.

### 4. Typography

Check:

- Arabic text is readable.
- Headings have clear hierarchy.
- Labels are consistent.
- Numbers align well.
- Table text is readable.
- Font weights are intentional.

Fail if:

- Typography feels default or inconsistent.
- Headings are too weak.
- Numbers jump visually in KPI cards/tables.
- Labels look different across similar sections.

### 5. Color and Status

Check:

- Brand blue is used consistently.
- Status colors are clear.
- Contrast is readable.
- Surfaces feel clean.
- Muted text is not too faint.
- Color is not the only indicator of status.

Fail if:

- Too many accent colors appear.
- Blue/purple AI gradient style appears.
- Status colors conflict.
- Important text has weak contrast.
- The interface feels visually noisy.

### 6. Component Consistency

Check:

- Buttons match variants.
- Cards match the design system.
- Tables follow the same pattern.
- Forms share the same layout.
- Badges use consistent status styling.
- Empty/loading/error states are present.

Fail if:

- One screen creates a new style without need.
- The same action has different styling across modules.
- Components look copied from different templates.

### 7. Interaction States

Check:

- Hover states exist where appropriate.
- Active/pressed states exist.
- Focus-visible states are clear.
- Disabled states are understandable.
- Loading states are specific.
- Error states are actionable.

Fail if:

- Buttons feel static.
- Keyboard focus is missing.
- Async actions have no feedback.
- Form errors are unclear.

### 8. Responsiveness

Check each target width.

At mobile:

- Primary actions visible
- No horizontal overflow
- Cards are not overloaded
- Tables adapt correctly

At tablet:

- Layout does not feel accidental
- Navigation is usable
- Grids adapt well

At desktop:

- Sidebar and content balance well
- Width is used effectively
- Dense dashboard remains readable

At wide desktop:

- Content does not stretch endlessly
- Containers remain controlled
- Layout still feels intentional

### 9. Accessibility

Check:

- Keyboard navigation
- Visible focus indicators
- Color contrast
- Semantic structure
- Meaningful labels
- Reduced-motion safety
- Touch target size

Fail if:

- Keyboard users cannot operate the screen.
- Focus indicator is invisible.
- Controls have no accessible labels.
- Text contrast is poor.

### 10. Arabic RTL Review

Check:

- Alignment is correct.
- Icons appear in sensible positions.
- Sidebar direction feels natural.
- Tables read correctly.
- Forms are not awkwardly mirrored.
- Copy is concise and business-like.

Fail if:

- Arabic labels feel machine-translated.
- Directional spacing is wrong.
- Icons imply the wrong direction.
- Text overflows due to Arabic length.

## Report Format

Use this format:

```md
# Visual QA Review — [Screen/Phase]

## Verdict

- Pass / Pass with fixes / Fail

## Blockers

- ...

## Important Fixes

- ...

## Optional Polish

- ...

## Responsive Notes

- 375px:
- 768px:
- 1024px:
- 1440px:
- 1920px:

## Accessibility Notes

- ...

## Product Fit Notes

- ...

## Recommended Next Action

- ...
```

## Severity

### Blocker

Must be fixed before the screen is accepted.

Examples:

- Broken layout
- Missing primary action
- Unusable mobile view
- Severe accessibility issue
- Functionality regression

### Important Fix

Should be fixed before moving too far.

Examples:

- Weak hierarchy
- Inconsistent components
- Poor desktop spacing
- Missing loading state
- Confusing status display

### Optional Polish

Can be deferred.

Examples:

- Micro-animation
- Slight spacing improvement
- Icon refinement
- Minor copy improvement

## Rules

- Review the actual rendered UI when possible.
- Do not invent visual issues just to produce feedback.
- Focus on fixes that materially improve product quality.
- Do not request unnecessary redesign if the screen already meets the standard.
- Keep recommendations specific and actionable.
