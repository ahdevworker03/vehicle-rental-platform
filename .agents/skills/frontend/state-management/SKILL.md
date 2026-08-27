---
name: state-management
description: React state management strategy, local state with useState and useReducer, lifting state up, prop drilling solutions with Context API, combining useReducer with Context for scalable state, and decision rules for when to use built-in React state vs external state managers like Zustand or Redux Toolkit. Applicable when managing component state, sharing state between components, designing state structure, or scaling state management across complex screens.
---

# State Management

## Purpose

This skill guides the agent in making state management decisions following React's official recommendations. It covers everything from local component state with `useState` and `useReducer`, to lifting state up for sharing between components, to using Context for deep prop passing, and combining `useReducer` with Context for scalable state management. The skill also provides clear decision rules for when built-in React state is sufficient and when to reach for external libraries like Zustand or Redux Toolkit.

---

## When to Load

- User is writing, reviewing, or refactoring any `.tsx` or `.jsx` file that involves state.
- User mentions: `useState`, `useReducer`, `useContext`, `Context`, `state`, `props`, `lifting state`, `prop drilling`, `state management`, `store`, `global state`.
- User asks about sharing state between components, avoiding prop drilling, or scaling state management.
- User is designing component architecture that involves data flow between multiple components.

---

## When NOT to Load

- Pure UI styling or layout decisions without state implications.
- Backend logic, database operations, or API route definitions.
- Infrastructure or deployment configuration.
- Pure TypeScript type definitions that do not involve React state.

---

## Core Principles

1. **State Drives UI** – Describe the UI you want for each state, not how to transition between them. Don't write commands like "disable the button"; instead, describe the "disabled" state and let React handle the UI.
2. **No Redundant or Duplicate State** – The most important principle is that state shouldn't contain redundant or duplicated information. If there's unnecessary state, you'll forget to update it and introduce bugs.
3. **Immutability** – Props and state are immutable snapshots with respect to a single render. Never mutate them directly.
4. **Purity** – Components must be idempotent: they should always return the same output for the same inputs (props, state, context).
5. **Lift State Up** – Share state between components by moving it to the closest common ancestor and passing it down via props.

---

## Decision Rules

### Structuring State

- **IF** two or more state variables are always updated together, **THEN** merge them into a single state variable.
- **IF** you can calculate some information from props or existing state during rendering, **THEN** do NOT store it in state – compute it on the fly.
- **IF** the same data appears in multiple state variables or nested objects, **THEN** reduce duplication to keep them in sync.
- **IF** state is deeply nested, **THEN** prefer a flat structure – deeply hierarchical state is not convenient to update.
- **IF** multiple pieces of state could contradict each other, **THEN** restructure to avoid inconsistencies.

### useState vs useReducer

- **IF** state is simple and local (form inputs, toggles, counters), **THEN** use `useState`.
- **IF** state logic involves multiple sub-values, complex transitions, or many update handlers, **THEN** prefer `useReducer` over multiple `useState` calls.
- **IF** you have many state updates spread across many event handlers, **THEN** consolidate all state update logic in a `reducer` function.

### Sharing State

- **IF** two or more components need to share state, **THEN** lift the state up to their closest common ancestor and pass it down via props.
- **IF** passing props becomes inconvenient because you need to pass through many components (prop drilling), **THEN** use Context to make information available to any component in the tree.
- **IF** you need both deep access and complex state logic, **THEN** combine `useReducer` with Context to manage state of a complex screen.

### React Context

- **IF** passing props through many intermediary components, **THEN** use Context to pass data deeply without prop drilling.
- **IF** the value changes frequently, **THEN** be cautious – Context re-renders all consumers on every change.
- **IF** you are combining Context with `useReducer`, **THEN** consider providing separate Contexts for state and dispatch to optimize re-renders.

### When to Use External State Managers (Zustand/Redux Toolkit)

- **IF** global state needs to be accessed by many components across the entire app, **THEN** evaluate whether React Context + useReducer is sufficient.
- **IF** the state is truly global and changes frequently, **THEN** consider Zustand for its simple API and performance.
- **IF** you need predictable state updates with complex workflows, **THEN** consider Redux Toolkit – it is the official recommended approach for writing Redux logic.
- **DO NOT** reach for external state managers prematurely. Start with React's built-in tools and scale up only when needed.

---

## Best Practices

1. **Group related state** – If you always update two or more state variables together, merge them into a single state variable. This prevents forgetting to keep them in sync.
2. **Calculate derived state during render** – Don't store values that can be computed from existing state or props. Compute them on the fly instead.
3. **Use reducer for complex state logic** – When you have many state updates across many event handlers, consolidate all logic in a reducer. Event handlers become concise – they only specify the user "actions".
4. **Lift state up before reaching for heavier solutions** – Use `useState`/`useReducer` for local component state, and lift state up before considering external managers.
5. **Use Context for values that change rarely** – Theme, locale, current user are good candidates. Context is not a state manager and re-renders all consumers on every change.
6. **Combine reducer and Context for scalability** – For complex screens, a parent component manages state with a reducer. Other components anywhere deep in the tree read state via Context and dispatch actions to update it.
7. **Keep state as low as possible** – Don't lift state higher than necessary. Keep transient state (form data, hover state) at the component level.
8. **Use immutability helpers** – When updating objects or arrays, always create new copies. Consider Immer to reduce repetitive copying.

---

## Anti-Patterns

| Anti-Pattern                                 | Why it is wrong (official)                                                   | Correct approach                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Storing derived state                        | Redundant state creates sync issues; you'll forget to update it.             | Calculate it during render.                                                                  |
| Storing duplicate state                      | Difficult to keep in sync; leads to bugs.                                    | Keep a single source of truth.                                                               |
| Mutating state directly                      | Breaks reactivity; React cannot detect changes.                              | Use setter functions or dispatch, always creating new copies.                                |
| Using Context for high-frequency updates     | Every change re-renders all consumers, hurting performance.                  | Use Context for coarse-grained data; use external state or memoization for frequent updates. |
| Prop drilling with intermediate components   | Creates unnecessary coupling and makes components less reusable.             | Use Context or component composition.                                                        |
| Reaching for Redux/Zustand too early         | Adds unnecessary complexity for simple state needs.                          | Start with useState/useReducer + lifting state up.                                           |
| Calling hooks conditionally                  | Violates Rules of Hooks; breaks React's ability to maintain state correctly. | Always call hooks at the top level.                                                          |
| Using `useState` when state logic is complex | Multiple useState calls become hard to manage and reason about.              | Use useReducer to consolidate state logic.                                                   |

---

## Common Mistakes & Edge Cases

| Mistake                                         | Symptom                                                 | Solution (official)                                                               |
| ----------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Not grouping related state                      | Forgetting to update one of several related variables.  | Merge them into a single state variable.                                          |
| Storing fullName alongside firstName + lastName | Redundant state that can go out of sync.                | Compute fullName during render.                                                   |
| Mutating state objects directly                 | UI doesn't update; React cannot detect changes.         | Always create new objects: `setState({ ...obj, field: newValue })`.               |
| Context re-rendering all consumers              | Performance issues with high-frequency updates.         | Split context by domain or use memoization.                                       |
| Prop drilling through many layers               | Components become tightly coupled and hard to maintain. | Use Context for deep data passing.                                                |
| Using `index` as key with stateful lists        | State gets mixed up when items reorder.                 | Use stable unique identifiers.                                                    |
| Forgetting to provide Context value             | Components cannot access context; errors occur.         | Always wrap consumers with a Provider.                                            |
| Mixing state update patterns inconsistently     | Hard to debug and maintain.                             | Be consistent: use useState for simple local state, useReducer for complex logic. |

---

## Related Skills

- `react` – for component structure and hooks usage.
- `typescript` – for strongly typing state, actions, and context.
- `data-fetching` – for server-state management with React Query/SWR.
- `performance` – for optimizing re-renders and state updates.

---

## Official References

- [Managing State – React Docs](https://react.dev/learn/managing-state)
- [Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [Rules of React](https://react.dev/reference/rules)
- [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state)
- [Redux Toolkit Official Docs](https://redux.js.org)
- [Zustand Official Docs](https://zustand.docs.pmnd.rs)
