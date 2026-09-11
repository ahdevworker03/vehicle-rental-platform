# Markab — مَركب

Markab is an Arabic-first, multi-tenant SaaS for vehicle-rental businesses. It supports daily fleet, customer, rental, payment, maintenance, task, analytics, and reporting workflows while preserving each tenant's separate business identity.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, Prisma, PostgreSQL
- Contracts: OpenAPI source specification with generated React client and Zod validation packages
- Tooling: pnpm workspace, ESLint, Prettier, Vitest

## Repository layout

```text
apps/
  api/       Express API
  web/       Arabic-first RTL React application
lib/
  api-spec/  OpenAPI contract source of truth
  api-client-react/
  api-zod/
  db/        Prisma schema and migrations
docs/        Product, architecture, and repository guidance
```

## Development

```bash
pnpm install
pnpm dev:api
pnpm dev:web
```

Useful checks:

```bash
pnpm --filter @workspace/web test
pnpm --filter @workspace/web typecheck
pnpm --filter @workspace/web build
pnpm lint
```

See [the product vision](docs/product/01-product-vision.md), [brand identity](docs/product/05-brand-identity.md), and [project rules](docs/rules/project.md).

## License

[MIT](LICENSE)
