---
name: shadcn
description: shadcn/ui usage in `apps/web`, including component installation, composition, and theme customization. Applicable when adding UI components, customizing themes, managing component dependencies, or building component libraries with shadcn/ui.
---

# shadcn/ui

## Purpose

This skill guides the agent in using shadcn/ui as a component distribution platform and design system. shadcn/ui is not a traditional component library – it provides open source component code that you own, modify, and distribute. The skill covers component installation via CLI, theming with CSS variables, dark mode, component composition, and custom registry patterns.

---

## When to Load

- User is adding, customizing, or reviewing shadcn/ui components in `.tsx` files.
- User mentions: `shadcn`, `shadcn/ui`, `components.json`, `npx shadcn`, `registry`, `cn util`.
- User asks about theming, CSS variables, dark mode, or component styling.
- User is setting up a new project or adding components to an existing project.
- User is building or distributing custom components via a registry.

---

## When NOT to Load

- Pure backend logic or database operations.
- General React component development without shadcn/ui involvement.
- Tailwind CSS styling decisions unrelated to shadcn/ui components.
- Infrastructure or deployment configuration.

---

## Core Principles

1. **Open Code, Not a Library** – shadcn/ui gives you the actual component code. You own and modify it directly. Edit the button code directly rather than overriding styles or wrapping components.
2. **Composition Over Configuration** – Every component uses a common, composable interface. If a component doesn't exist, bring it in, make it composable, and adjust its style to match the design system.
3. **CSS Variables for Theming** – Use CSS variables for semantic theme tokens (`background`, `foreground`, `primary`, etc.). Tailwind maps these to utilities like `bg-background`, `text-foreground`.
4. **CLI-First Distribution** – Use the shadcn CLI to add, update, and manage components. The CLI handles dependencies, installs the `cn` utility, and configures CSS variables.
5. **AI-Ready by Design** – Open code and consistent APIs allow AI models to read, understand, and generate components that integrate with your existing design system.

---

## Decision Rules

### Adding Components

- **IF** you need a new UI component, **THEN** use `npx shadcn@latest add [component-name]` to install it.
- **IF** you need to see what a component looks like before installing, **THEN** use `npx shadcn@latest view [component-name]` to preview it from the registry.
- **IF** you need to search for components in registries, **THEN** use `npx shadcn@latest search [query]` to find them.
- **IF** adding multiple components, **THEN** list them all in the add command: `npx shadcn@latest add button card dialog`.

### Theming

- **IF** customizing the look of your app, **THEN** override CSS variables in your CSS file under `:root` and `.dark` selectors – do not rewrite component classes.
- **IF** you need a visual theme builder, **THEN** use [shadcn/create](https://ui.shadcn.com/create) to preview colors, radius, fonts, and icons, then generate a preset.
- **IF** applying only theme or fonts from a preset without reinstalling components, **THEN** use `npx shadcn@latest apply --only=theme` or `--only=font`.

### Dark Mode

- **IF** adding dark mode to your site, **THEN** use the `.dark` selector to override CSS variables for dark theme.
- **IF** using Next.js, Vite, Astro, Remix, or TanStack Start, **THEN** follow the framework-specific dark mode guide.

### Custom Registry

- **IF** distributing custom components across projects, **THEN** set up a custom registry following the shadcn registry schema.
- **IF** using components from community registries, **THEN** configure namespaces in your project.
- **IF** securing a private registry, **THEN** implement authentication for registry access.

---

## Best Practices

1. **Initialize properly** – Run `npx shadcn@latest init` to install dependencies, add the `cn` utility, and configure CSS variables for your project.
2. **Keep `components.json` in version control** – This file tracks your configuration and makes setup reproducible.
3. **Use semantic theme tokens** – Leverage the predefined token pairs: `background`/`foreground`, `card`/`card-foreground`, `primary`/`primary-foreground`, `muted`/`muted-foreground`, `accent`/`accent-foreground`, `destructive`, `border`, `input`, `ring`.
4. **Maintain dark mode CSS variables** – Always define both `:root` and `.dark` selectors with appropriate variable values.
5. **Customize components by editing source code** – Since you own the component code, modify it directly rather than using workarounds.
6. **Use the `cn` utility for class merging** – The `cn` function (installed during init) handles conditional classes and Tailwind class conflicts.
7. **Set `tailwind.cssVariables` to `true`** – This ensures Tailwind maps CSS variables to utility classes.
8. **Choose a consistent icon library** – shadcn supports Lucide, Tabler, Hugeicons, Phosphor, Remixicon, and Radix. Set `iconLibrary` in `components.json` and use the migration CLI to switch if needed.

---

## Anti-Patterns

| Anti-Pattern                                | Why it is wrong                                                                    | Correct approach                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Treating shadcn as an NPM library           | You lose the ability to customize components directly; you're fighting the design. | Install components via CLI and edit the source code.       |
| Overriding styles instead of editing source | Creates brittle workarounds and increases technical debt.                          | Edit the component code directly.                          |
| Hardcoding color values in components       | Breaks theming consistency and makes dark mode difficult.                          | Use CSS variable tokens (`bg-primary`, `text-foreground`). |
| Not defining dark mode variables            | Dark mode will not work correctly.                                                 | Always define `.dark` selector with appropriate overrides. |
| Adding components without the CLI           | Missing dependencies, missing `cn` utility, broken styling.                        | Always use `npx shadcn@latest add`.                        |
| Modifying `components.json` manually        | Can break CLI functionality and project configuration.                             | Use CLI commands or visual tools like shadcn/create.       |

---

## Common Mistakes & Edge Cases

| Mistake                           | Symptom                                               | Solution                                                                                            |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Components not styled correctly   | Missing CSS variables or Tailwind configuration.      | Verify `tailwind.cssVariables: true` in `components.json` and that CSS variables are defined.       |
| Dark mode not working             | `.dark` selector missing or variables not overridden. | Add `.dark` CSS selector with dark theme variable values.                                           |
| CLI commands fail                 | Wrong Node version or missing dependencies.           | Ensure Node.js 18+ and run `npm install` before CLI commands.                                       |
| Component imports broken          | Path aliases not configured.                          | Check `components.json` for correct `aliases` configuration.                                        |
| Icon imports fail                 | Icon library mismatch or not installed.               | Verify `iconLibrary` in `components.json` matches installed package. Use `migrate icons` to switch. |
| Registry items not found          | Wrong registry URL or namespace.                      | Verify registry configuration and use `--registry` flag if needed.                                  |
| Styles conflict with existing CSS | CSS variable names collide.                           | Use shadcn's semantic token system consistently; avoid custom variable names.                       |

---

## Related Skills

- `react` – for component structure and hooks within shadcn/ui components.
- `tailwind` – for styling utilities used by shadcn/ui components.
- `typescript` – for strongly typing component props and variants.
- `frontend-ui-engineering` – for combining shadcn/ui with broader UI design decisions.
- `accessibility` – shadcn/ui components are built with accessibility in mind; ensure customizations preserve this.

---

## Official References

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Introduction & Philosophy](https://ui.shadcn.com/docs)
- [Theming Guide](https://ui.shadcn.com/docs/theming)
- [CLI Reference](https://ui.shadcn.com/docs/cli)
- [Components List](https://ui.shadcn.com/docs/components)
- [Dark Mode](https://ui.shadcn.com/docs/dark-mode)
- [Registry Documentation](https://ui.shadcn.com/docs/registry)
- [shadcn/create – Visual Theme Builder](https://ui.shadcn.com/create)
