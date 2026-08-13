# UI / UX Rules

Apply these rules to every user-facing change.

## Product Principles

- This is a business productivity platform, not a marketing website.
- Design for speed, clarity, and repeated daily use.
- Prioritize task completion over visual experimentation.
- Consistency is more important than novelty.

## Language & Layout

- Arabic is the primary application language unless explicitly specified otherwise.
- Design RTL-first rather than adapting LTR layouts.
- Use terminology defined in the product documentation.
- Keep labels short, clear, and business-oriented.

## Mobile First

- Design for portrait mobile devices first.
- Scale progressively to tablets and desktop.
- Preserve one-handed usability whenever practical.
- Desktop layouts should extend the mobile experience rather than redesign it.

## Design System

- Follow the project's Design System as the single source of truth.
- Reuse existing components before creating new ones.
- Keep spacing, typography, colors, and interaction patterns consistent.
- Do not introduce visual styles that conflict with the established design language.

## User Experience

- Minimize the number of steps required to complete common tasks.
- Keep navigation predictable and easy to learn.
- Prioritize readability over visual density.
- Reduce cognitive load whenever possible.

## Accessibility

- Follow the `accessibility` skill (WCAG 2.1/2.2) for implementation details.
- Provide clear labels, validation messages, and feedback.

## User Feedback

- User-facing flows must include loading, empty, success, and error states.
- Messages should be short, clear, and understandable by non-technical users.
- Avoid unnecessary animations or visual effects that do not improve usability.

## Separation of Concerns

- Keep presentation separate from business logic.
- UI components should remain reusable whenever practical.
- Follow the documented frontend architecture when implementing interfaces.
