---
name: accessibility
description: Accessibility work for `apps/web`, including semantic HTML, ARIA, keyboard navigation, focus management, and contrast checks. Applicable when making UI accessible, implementing ARIA attributes or semantic HTML, auditing against WCAG 2.1/2.2 standards, managing focus and keyboard navigation, supporting screen readers, or ensuring inclusive user experiences.
---

# Accessibility

## Purpose

This skill guides the agent in building accessible web applications following WCAG 2.1/2.2 (Level AA) standards and React's official accessibility recommendations. It ensures all users, including those using assistive technologies (screen readers, keyboard navigation, voice control), can effectively use the application. The skill emphasizes semantic HTML first, ARIA as a supplement, and keyboard accessibility as a core requirement.

---

## When to Load

- User is writing or reviewing UI with an accessibility focus (not general React work — see `react` skill).
- User mentions: `accessibility`, `a11y`, `ARIA`, `role`, `aria-label`, `tabIndex`, `focus`, `screen reader`, `keyboard navigation`, `WCAG`, `semantic HTML`.
- User asks about forms, modals, dialogs, focus management, or keyboard interactions.
- User is designing components that need to be inclusive (buttons, links, inputs, modals, tooltips, dropdowns).

---

## When NOT to Load

- Pure backend logic or database operations.
- Infrastructure or deployment configuration.
- Styling decisions that do not affect accessibility (e.g., purely decorative colors that meet contrast).
- General TypeScript types that do not involve UI interactions.

---

## Core Principles

1. **Semantic HTML First** – Use the correct HTML element for the job (`<button>` for buttons, `<a>` for links, `<input>` for inputs). Semantic elements provide built-in accessibility for free.
2. **Keyboard Accessibility** – All functionality must be operable via keyboard alone. No user should be trapped in any part of the UI.
3. **ARIA Only When Necessary** – ARIA (Accessible Rich Internet Applications) is a bridge for HTML's limitations. Do not use ARIA if a semantic HTML element works. "No ARIA is better than bad ARIA."
4. **Focus Management** – Manage focus predictably. Focus should never be lost, and it should move logically through the interface.
5. **Color and Contrast** – Ensure sufficient color contrast for text and interactive elements. Do not rely solely on color to convey meaning.
6. **Screen Reader Compatibility** – Provide text alternatives for non-text content. Use ARIA labels, descriptions, and live regions appropriately.
7. **Error Identification** – Clearly identify errors and provide instructions for recovery. All errors must be programmatically determinable.

---

## Decision Rules

### Semantic HTML vs. ARIA

- **IF** a native HTML element has the desired behavior and styling is the only concern, **THEN** use the native element and style it with CSS. For example, use `<button>` for buttons, `<a>` for links.
- **IF** a native element cannot achieve the desired visual design but the behavior is the same, **THEN** use the native element and style it accordingly – do not rebuild its functionality.
- **IF** no native HTML element exists for the desired behavior (e.g., a tab panel, slider, or custom dropdown), **THEN** use ARIA roles, states, and properties to provide the necessary semantics.
- **IF** you are unsure whether to use ARIA, **THEN** default to semantic HTML. "No ARIA is better than bad ARIA."

### Keyboard Navigation

- **ALWAYS** ensure all interactive elements are focusable via Tab.
- **IF** a component is a button, **THEN** use `<button>` which responds to Enter and Space automatically.
- **IF** a component is a link, **THEN** use `<a>` which responds to Enter automatically.
- **IF** a custom interactive element is built using `<div>` or `<span>`, **THEN** add `tabIndex={0}` to make it focusable and add keyboard event handlers for Enter, Space, and Arrow keys as appropriate.
- **IF** a component contains multiple interactive elements that form a group (e.g., radio buttons), **THEN** use `role="radiogroup"` and manage `tabIndex` so only one is in the tab order.
- **IF** a component is a modal or dialog, **THEN** trap focus inside the modal when open. Focus should not escape to background content.

### Focus Management

- **IF** a component opens (modal, dropdown, popover), **THEN** programmatically move focus to the first focusable element inside or a designated focus target.
- **IF** a component closes (modal, dialog), **THEN** return focus to the element that triggered the open.
- **IF** focus needs to move within a component (e.g., arrow keys in a dropdown), **THEN** manage focus accordingly.
- **ALWAYS** ensure `tabIndex={-1}` is used sparingly – only to remove elements from the tab order while keeping them programmatically focusable.

### ARIA Labels

- **IF** an element has no visible text label but still conveys meaning (e.g., icon button), **THEN** use `aria-label` to provide a descriptive label.
- **IF** an element has a visible label that is not programmatically associated (e.g., custom checkbox), **THEN** use `aria-labelledby` referencing the visible label's `id`.
- **IF** an element has a visible label that is programmatically associated (e.g., `<label htmlFor="...">`), **THEN** do NOT add ARIA labels – they may override the visible label.

### Color and Contrast

- **ALWAYS** ensure text and interactive elements meet WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text (18pt or 14pt bold), and 3:1 for UI components and graphical objects.
- **IF** color is used to convey meaning (e.g., error state in red), **THEN** also provide a text-based cue (e.g., an error message or icon).
- **IF** a component's state is indicated only by color (e.g., active tab), **THEN** also use other indicators like underline, bold, or an ARIA state.

---

## Best Practices

1. **Use semantic HTML elements** – Prefer `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, `<h1>`–`<h6>`, `<p>`, `<ul>`, `<ol>`, `<table>`, `<form>`, `<fieldset>`, `<legend>`, `<label>`. These provide built-in semantics and behavior.
2. **Manage focus predictably** – Use `ref` and `useEffect` to programmatically focus elements when needed.
3. **Provide text alternatives** – Use `alt` for images, `aria-label` for icon buttons, and `aria-labelledby` for complex elements.
4. **Ensure sufficient contrast** – Use tools like the WebAIM Contrast Checker to verify color contrast ratios.
5. **Use ARIA roles and states** – When semantic HTML is impossible, add appropriate ARIA attributes:
   - `role="dialog"`, `aria-modal="true"` for modals
   - `role="tab"`, `role="tabpanel"`, `aria-selected` for tabs
   - `role="button"` for custom buttons
   - `role="alert"` for error messages
   - `role="status"` or `aria-live="polite"` for dynamic updates
   - `aria-expanded` for collapsible elements
   - `aria-controls` for controlled elements
   - `aria-describedby` for additional descriptions
6. **Ensure all interactive elements are keyboard accessible** – Test with keyboard only: Tab, Enter, Space, Escape, Arrow keys.
7. **Use `useId` for ID generation** – In React 18+, use `useId()` to generate stable, unique IDs for ARIA associations:
   ```tsx
   const id = useId();
   <label htmlFor={id}>Name</label>
   <input id={id} />
   ```
8. **Use `aria-hidden` for decorative content** – Hide purely decorative images and icons from screen readers with `aria-hidden="true"`.
9. **Provide skip links** – Add a "Skip to main content" link at the top of the page for keyboard users.
10. **Announce dynamic changes** – Use `aria-live="polite"` or `role="status"` for updates that are not triggered by user interaction.

---

## Anti-Patterns

| Anti-Pattern                                            | Why it is wrong                                                        | Correct approach                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Using `<div>` with `onClick` as a button                | No keyboard support; screen readers do not identify it as a button.    | Use `<button>` or add `role="button"`, `tabIndex={0}`, and keyboard handlers.   |
| Removing focus outlines                                 | Makes it impossible for keyboard users to see where they are.          | Keep default outlines or provide a custom, visible focus style.                 |
| Using ARIA when semantic HTML suffices                  | "No ARIA is better than bad ARIA." Overuse can confuse screen readers. | Use semantic HTML by default.                                                   |
| Relying solely on color to convey meaning               | Colorblind users cannot distinguish; screen readers ignore color.      | Add text, icons, or patterns as secondary indicators.                           |
| Missing form labels                                     | Screen reader users do not know what to input.                         | Always associate labels with inputs using `<label>` or `aria-label`.            |
| Not managing focus in modals                            | Focus can escape or get lost; keyboard users become trapped.           | Trap focus inside modals; return focus to trigger on close.                     |
| Using `tabIndex={0}` on non-interactive elements        | Adds unnecessary focusable elements; confuses navigation.              | Only make interactive elements focusable.                                       |
| Hiding content with `display:none` while still relevant | Screen readers cannot access hidden content.                           | Use `aria-hidden` or `hidden` attribute; ensure hidden content is truly hidden. |

---

## Common Mistakes & Edge Cases

| Mistake                                        | Symptom                                            | Solution                                                                                      |
| ---------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Forgetting `alt` text for images               | Screen readers read the file name or nothing.      | Add descriptive `alt` text; use `alt=""` for decorative images.                               |
| Using `aria-label` on non-interactive elements | Screen readers may ignore it; adds no value.       | Only use `aria-label` on interactive elements or landmarks.                                   |
| Not providing visible focus indicators         | Keyboard users cannot navigate.                    | Use `focus-visible` to show focus only when needed.                                           |
| Using `role` incorrectly                       | Screen readers misinterpret the element's purpose. | Verify ARIA roles with the official ARIA specification.                                       |
| Trapping focus in modal without return         | Focus stays in modal after closing.                | Store the trigger element ref and restore focus on close.                                     |
| Using `aria-describedby` with invalid ID       | Screen readers ignore the attribute.               | Ensure IDs are valid and exist in the DOM.                                                    |
| Adding too many `aria-live` regions            | Causes excessive announcements; overwhelms users.  | Use `aria-live="polite"` sparingly; prefer `aria-live="assertive"` only for critical updates. |
| Forgetting to hide decorative icons            | Screen readers announce the icon unexpectedly.     | Add `aria-hidden="true"` and `focusable="false"` for SVG icons.                               |

---

## Related Skills

- `react` – for implementing accessibility with React components and hooks.
- `tailwind` – for styling with accessible color contrast and focus states.
- `shadcn` – for using accessible components that follow best practices.
- `frontend-ui-engineering` – for integrating accessibility into UI design workflows.
- `testing` – for using accessibility testing tools (axe-core, jest-axe).

---

## Official References

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WCAG 2.2 Guidelines](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.2/)
- [WAI-ARIA Specification](https://www.w3.org/TR/wai-aria-1.2/)
- [React Accessibility Docs](https://react.dev/reference/react-dom/components#accessibility)
- [WebAIM – Introduction to Accessibility](https://webaim.org/intro/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Axe Accessibility Testing Tool](https://www.deque.com/axe/)
- [Inclusive Components](https://inclusive-components.design/) (Community inspiration – official only when referenced)
