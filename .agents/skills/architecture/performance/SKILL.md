---
name: performance
description: Performance work for `apps/web`, `apps/api`, and the Prisma/Postgres layer, including rendering, query tuning, caching, and load-time optimization. Applicable when optimizing application speed, diagnosing performance bottlenecks, implementing caching strategies, or reducing load times.
---

# Performance

## Purpose

This skill guides the agent in optimizing performance across the full stack — from frontend React applications to backend Express servers and PostgreSQL databases. It covers measurement, profiling, optimization techniques, and monitoring based on official documentation from React, Express, PostgreSQL, and Web Vitals. The goal is to identify and eliminate performance bottlenecks, ensuring fast load times, smooth interactions, and efficient resource usage.

---

## When to Load

- User is diagnosing or fixing performance issues in the application.
- User mentions: `performance`, `perf`, `slow`, `bottleneck`, `optimization`, `optimize`, `Lighthouse`, `Web Vitals`, `load time`, `TTFB`, `FCP`, `LCP`, `CLS`, `INP`.
- User asks about optimizing React components, Express routes, or database queries.
- User is implementing caching, code splitting, lazy loading, or memoization.
- User is running performance audits or setting up performance monitoring.

---

## When NOT to Load

- General feature development without performance implications.
- Pure UI design without performance considerations.
- Infrastructure or deployment configuration (unless directly performance-related).
- General TypeScript or code style discussions.

---

## Core Principles

1. **Measure Before Optimizing** – Never optimize without data. Use performance profiling tools, Lighthouse, and real user monitoring to identify actual bottlenecks before making changes.
2. **Optimize Critical Path First** – Focus on the user-visible critical path (initial load, interactive time). Optimizations outside the critical path have minimal impact on user experience.
3. **Cache Aggressively, Invalidate Correctly** – Caching is the most effective performance technique. Cache at every level (browser, CDN, server, database) and ensure cache invalidation is correct.
4. **Minimize Network Round Trips** – Reduce the number of requests, payload sizes, and latency. Use HTTP/2 or HTTP/3, compress responses, and bundle efficiently.
5. **Optimize for the Common Case** – Optimize the typical user journey rather than edge cases. Edge cases matter but should not dictate architecture if they are rarely used.
6. **Monitor in Production** – Performance in development is not production performance. Use Real User Monitoring (RUM) and synthetic monitoring to track performance in the wild.

---

## Decision Rules

### Performance Measurement

- **IF** you need to measure frontend performance, **THEN** use Lighthouse (Chrome DevTools) to get a comprehensive performance score with actionable recommendations.
- **IF** you need to measure Core Web Vitals (LCP, INP, CLS), **THEN** use the Web Vitals library to collect real user metrics.
- **IF** you need to profile React component performance, **THEN** use the React DevTools Profiler to identify slow renders and component updates.
- **IF** you need to profile backend performance (response times, database queries, CPU usage), **THEN** use Node.js built-in profiler (`--prof`), APM tools (e.g., Datadog, New Relic), or logging with timing information.
- **IF** you need to measure database query performance, **THEN** use `EXPLAIN ANALYZE` to analyze execution plans and identify slow queries.

### Frontend Optimization

- **IF** a component re-renders unnecessarily, **THEN** use `React.memo`, `useMemo`, or `useCallback` to prevent wasted renders.
- **IF** a component renders a long list, **THEN** use virtualization (`react-window`, `react-virtualized`) to render only visible items.
- **IF** a component includes a large library or dependency, **THEN** use code splitting (`React.lazy`, `Suspense`) to load it only when needed.
- **IF** a component or library is not needed on initial load, **THEN** lazy load it with dynamic imports.
- **IF** images are slowing down the page, **THEN** use lazy loading (`loading="lazy"`), responsive images (`srcset`), and modern formats (WebP, AVIF).
- **IF** assets are large, **THEN** compress them (gzip, Brotli), minify code, and use tree shaking to eliminate unused code.
- **IF** JavaScript is blocking rendering, **THEN** use `defer` or `async` attributes, or load non-critical scripts after the page is interactive.

### Backend Optimization

- **IF** the Express server handles many concurrent requests, **THEN** ensure asynchronous operations are used throughout – never block the event loop.
- **IF** a route handler is slow, **THEN** optimize the business logic, cache responses, or defer work to background jobs.
- **IF** responses are large, **THEN** use gzip or Brotli compression via `compression` middleware.
- **IF** the application serves static assets, **THEN** use a CDN for global delivery and static file caching.
- **IF** the Express app is CPU-bound, **THEN** use Node.js clustering (`cluster` module) to utilize multiple CPU cores, or deploy in a multi-process environment.
- **IF** the Express app has high connection overhead, **THEN** use connection pooling for database connections (Prisma handles this automatically with its built-in connection pool).
- **IF** using Prisma, **THEN** Prisma Client's query engine is already optimized for performance and handles connection pooling automatically.

### Database Optimization

- **IF** a database query is slow, **THEN** use `EXPLAIN ANALYZE` to understand the execution plan.
- **IF** a query performs a sequential scan, **THEN** create appropriate indexes.
- **IF** a query is complex with many joins, **THEN** consider optimizing the query structure or denormalizing data.
- **IF** you are fetching large datasets, **THEN** use pagination (`skip`/`take` or cursor-based) to limit the result set size.
- **IF** the database has high load, **THEN** optimize `shared_buffers`, `work_mem`, and `effective_cache_size` settings.

### Caching

- **IF** data is read frequently and changes rarely, **THEN** implement caching at the appropriate level (browser, CDN, server, or database).
- **IF** you need to cache HTTP responses, **THEN** set appropriate `Cache-Control` headers.
- **IF** you need to cache database query results, **THEN** consider using Redis or in-memory caching for frequently accessed data.
- **IF** using Prisma, **THEN** consider caching query results at the application level rather than at the Prisma Client level.

### Monitoring and Alerting

- **ALWAYS** set up performance monitoring for production applications (Lighthouse CI, Web Vitals, APM tools).
- **IF** a performance metric consistently exceeds a threshold, **THEN** set up alerts to notify the team.
- **IF** deploying a change that affects performance, **THEN** use performance regression testing in CI/CD (e.g., Lighthouse CI).

---

## Best Practices

### Frontend – React

1. **Use production builds** – Always use the production build of React for deployment; development builds include warnings and are much slower.
2. **Use `React.memo` for pure components** – It prevents re-rendering when props haven't changed.
3. **Use `useMemo` for expensive computations** – It caches the result of an expensive calculation between renders.
4. **Use `useCallback` for stable function references** – It prevents child components from re-rendering unnecessarily.
5. **Virtualize long lists** – Use `react-window` or `react-virtualized` for lists with more than ~100 items.
6. **Code split large components** – Use `React.lazy` and `Suspense` for route-based or component-based code splitting.
7. **Lazy load images** – Use `loading="lazy"` for images below the fold.
8. **Use a CDN for static assets** – Serve static files from a CDN for faster global delivery.
9. **Minimize bundle size** – Use tools like `webpack-bundle-analyzer` to identify large dependencies and eliminate them.

### Backend – Express

1. **Use asynchronous operations** – Ensure all I/O operations are async to avoid blocking the event loop.
2. **Enable compression** – Use `compression` middleware to gzip or Brotli responses.
3. **Use clustering** – For multi-core systems, use Node.js clustering or a process manager like PM2 to utilize all CPU cores.
4. **Implement caching** – Use Redis or in-memory caching for frequently accessed data.
5. **Log performance** – Log response times for slow routes.
6. **Use a reverse proxy** – Use Nginx or a CDN to serve static files and terminate SSL.
7. **Use HTTP/2 or HTTP/3** – Reduce latency with modern HTTP versions.

### Database – PostgreSQL

1. **Index foreign keys and frequently queried columns** – Indexing speeds up joins and searches.
2. **Use `EXPLAIN ANALYZE`** – Understand and optimize query execution plans.
3. **Use pagination** – Limit the number of rows returned from large tables.
4. **Regularly vacuum and analyze** – Maintain table statistics and prevent bloat.
5. **Batch operations** – Use bulk inserts and updates to reduce round trips.
6. **Use connection pooling** – Prisma's default connection pool handles this automatically.

### Monitoring

1. **Use Lighthouse CI** – Automate performance audits in CI/CD to catch regressions.
2. **Collect Core Web Vitals** – Use the Web Vitals library to track LCP, INP, and CLS in production.
3. **Use APM tools** – Use Datadog, New Relic, or similar for backend performance monitoring.
4. **Set performance budgets** – Define and enforce performance budgets (e.g., bundle size < 200KB, TTI < 3s) in CI/CD.

---

## Anti-Patterns

| Anti-Pattern                        | Why it is wrong                                                          | Correct approach                                                    |
| ----------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Premature optimization              | Without data, you may optimize the wrong thing and introduce complexity. | Measure first; optimize the critical path.                          |
| Over-optimizing                     | Optimizations increase complexity and may harm maintainability.          | Only optimize when there is a real performance problem.             |
| Not caching                         | Repeated computations and network requests waste resources.              | Cache aggressively where appropriate.                               |
| Blocking the event loop (sync code) | CPU-intensive sync operations block all other requests.                  | Use asynchronous operations and offload CPU work to worker threads. |
| Disabling compression               | Large payloads increase network time and bandwidth.                      | Always compress responses and assets.                               |
| Not monitoring production           | Performance issues go unnoticed until users complain.                    | Implement performance monitoring from day one.                      |
| Over-indexing                       | Extra indexes slow down write operations.                                | Index only columns that are frequently queried.                     |
| Returning too much data             | Large result sets increase memory and network usage.                     | Use pagination or field selection.                                  |

---

## Common Mistakes & Edge Cases

| Mistake                                     | Symptom                                                                | Solution                                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Measuring performance without caching       | Cached results obscure real performance.                               | Clear caches between measurements.                                         |
| Not testing on slow networks                | Performance appears good on fast networks but fails in the real world. | Test with throttled network conditions (e.g., 3G).                         |
| Using `React.memo` with non-primitive props | Memoization fails; component still re-renders.                         | Use `useMemo` for objects and `useCallback` for functions passed as props. |
| Not using `useId` for accessibility         | Performance issues with hydration mismatches.                          | Use `useId` for stable IDs.                                                |
| Ignoring TTFB                               | TTFB affects LCP; slow backend delays first byte.                      | Optimize backend response times and CDN proximity.                         |
| Not handling rate limiting                  | High traffic overwhelms the server; cascading failures.                | Implement rate limiting and circuit breakers.                              |
| Running queries without `EXPLAIN ANALYZE`   | Query is slow but you don't know why.                                  | Always analyze with `EXPLAIN ANALYZE`.                                     |
| Not invalidating caches after updates       | Users see stale data.                                                  | Invalidate caches after writes; implement proper cache invalidation.       |

---

## Related Skills

- `react` – for frontend React performance optimizations (memoization, virtualization).
- `express` – for backend Express server performance and profiling.
- `postgresql` – for database performance tuning and query optimization.
- `prisma` – for optimizing Prisma queries and migrations.
- `deployment` – for CDN configuration and performance-related infrastructure.
- `logging-monitoring` – for setting up performance monitoring and alerts.
- `testing` – for performance regression testing in CI/CD.

---

## Official References

- [React Performance Optimization – React Docs](https://react.dev/learn/render-and-commit)
- [React Optimizing Performance – React Docs](https://react.dev/learn/optimizing-performance)
- [React Developer Tools – Profiler](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools – Performance Features](https://developer.chrome.com/docs/devtools/performance/)
- [Core Web Vitals – Google](https://web.dev/vitals/)
- [Lighthouse Performance Scores – Google](https://developer.chrome.com/docs/lighthouse/performance/)
- [Web Vitals Library – GitHub](https://github.com/GoogleChrome/web-vitals)
- [Express Performance Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Performance – Official Docs](https://nodejs.org/en/docs/guides/simple-profiling/)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [PostgreSQL Query Analysis with EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [Prisma Performance Optimization](https://www.prisma.io/docs/orm/prisma-client/queries/advanced/query-optimization-performance)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Web Performance – Google Developers](https://developers.google.com/web/fundamentals/performance)
