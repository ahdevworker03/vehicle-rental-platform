---
name: logging-monitoring
description: Logging and monitoring for `apps/api` and `apps/web`, including pino logs, health checks, metrics, and production observability. Applicable when implementing logging, setting up monitoring, configuring alerting, or debugging production issues.
---

# Logging & Monitoring

## Purpose

This skill guides the agent in implementing comprehensive logging and monitoring for production applications following the Twelve-Factor App principles and industry best practices. Logging provides visibility into application behavior, errors, and performance. Monitoring enables proactive detection of issues, capacity planning, and performance optimization. The skill covers structured logging, log levels, redaction, log aggregation, APM integration, health checks, metrics, and alerting.

---

## When to Load

- User is implementing or reviewing logging in application code.
- User mentions: `logging`, `monitoring`, `log`, `logger`, `pino`, `winston`, `structured logging`, `log level`, `APM`, `health check`, `metrics`, `alerting`, `Datadog`, `Logtail`.
- User asks about production observability, debugging production issues, or setting up monitoring.
- User is configuring log aggregation, APM, or alerting.
- User is implementing health checks or metrics endpoints.

---

## When NOT to Load

- Writing application code without logging implications.
- General architecture design without observability considerations.
- Infrastructure or deployment configuration unrelated to logging/monitoring.
- Security or authentication implementation (see `security` skill).

---

## Core Principles

1. **Logs Are Events, Not Strings** – Logs should be structured (JSON) with consistent fields (timestamp, level, message, context). Avoid unstructured text logs.
2. **Log Levels Are for Action** – Use appropriate log levels: error for failures requiring immediate attention, warn for potential issues, info for normal operations, debug for detailed troubleshooting, trace for verbose debugging.
3. **Never Log Secrets** – Passwords, tokens, PII, and session IDs must never appear in logs. Implement redaction and sanitization.
4. **Centralize Logs** – Stream logs to a centralized system (Datadog, Logtail, AWS CloudWatch, Elasticsearch) for analysis and alerting.
5. **Monitor Key Metrics** – Track request latency, error rates, throughput, resource usage, and business metrics. Alert on anomalies.
6. **Proactive Health Checks** – Implement health check endpoints for readiness and liveness probes. Use them to detect and recover from failures.
7. **Correlate Logs and Metrics** – Use request IDs, trace IDs, and correlation IDs to link logs and metrics across services.

---

## Decision Rules

### Logging Library Selection

- **IF** you need high performance and low overhead, **THEN** use `pino` (fast, lightweight, JSON logger).
- **IF** you need extensive features and flexibility, **THEN** use `winston` (rich transports, custom formats, but slower).
- **IF** you are building a web application with structured logging, **THEN** pino is generally the recommended choice for Node.js.
- **ALWAYS** use structured logging (JSON) for machine-parseable logs.

### Log Levels

- **`error`** – Critical errors that prevent the application from functioning. Must be alerted immediately.
- **`warn`** – Unexpected but not fatal issues that may become errors (e.g., deprecated API usage, slow queries).
- **`info`** – Significant operations (e.g., user authentication, successful requests, important state changes).
- **`debug`** – Detailed troubleshooting information for developers (e.g., request payloads, internal decisions).
- **`trace`** – Verbose logs for deep debugging (e.g., function entry/exit, variable values).
- **IF** in production, **THEN** set log level to `info` or `warn` to reduce noise and improve performance.
- **IF** in development, **THEN** set log level to `debug` or `trace` for full visibility.

### Structured Logging Format

- **ALWAYS** include these fields in every log entry:
  - `timestamp`: ISO 8601 timestamp.
  - `level`: Log level.
  - `message`: Human-readable description.
  - `context`: Additional structured data (e.g., `{ userId, requestId, route }`).
- **ALWAYS** include `requestId` or `traceId` in every request log to correlate logs across services and requests.
- **IF** using pino, **THEN** use `pino`'s built-in `req` and `res` serializers for automatic request/response logging.
- **IF** using winston, **THEN** configure custom JSON formatters.

### Log Redaction

- **IF** logging request bodies or responses, **THEN** redact sensitive fields like passwords, tokens, credit card numbers, and PII.
- **IF** using pino, **THEN** use `pino`'s `redact` option to specify paths to redact (e.g., `redact: ['req.body.password', 'req.headers.authorization']`).
- **IF** using winston, **THEN** use a custom filter or `winston`'s `maskFields` option.
- **NEVER** log secrets, session IDs, or any data that could compromise security.

### Health Checks

- **ALWAYS** implement a `/health` endpoint that returns `200 OK` when the application is running.
- **IF** the application depends on external services (database, cache, API), **THEN** include them in the health check (return `503` if any dependency is unavailable).
- **IF** using Docker or Kubernetes, **THEN** configure liveness and readiness probes to use the health endpoint.
- **ALWAYS** return structured JSON with status, timestamp, and details of each dependency.

### Metrics Collection

- **IF** monitoring application performance, **THEN** use an APM tool like Datadog, New Relic, or OpenTelemetry.
- **IF** tracking custom business metrics, **THEN** use `prom-client` (Prometheus) or a similar library to expose metrics.
- **ALWAYS** monitor:
  - Request count, error rate, and latency (p50, p95, p99).
  - Database query performance (duration, error rate).
  - Memory usage, CPU usage, event loop lag.
  - External API calls (latency, error rate).
- **IF** using OpenTelemetry, **THEN** instrument your application with auto-instrumentation for Express, Prisma, and other libraries.

### Alerting

- **IF** an error rate exceeds a threshold (e.g., >5% over 5 minutes), **THEN** trigger an alert.
- **IF** request latency exceeds a threshold (e.g., p95 > 500ms), **THEN** trigger an alert.
- **IF** resource usage exceeds thresholds (e.g., memory >90%, CPU >80%), **THEN** trigger an alert.
- **IF** a critical dependency is down, **THEN** trigger an alert.
- **ALWAYS** set up alerts for any error logs at `error` level in production (or at least for critical errors).

---

## Best Practices

### Logging Implementation

1. **Create a logger module** – Centralize logger configuration (level, format, redaction, transports) in `src/lib/logger.ts`.
2. **Attach request context** – Use middleware to create a unique `requestId` and attach it to all logs in that request. Use `async_hooks` or `cls-hooked` for automatic context propagation (or pino's `child` logger).
3. **Log structured data** – Always include structured fields, not string concatenation:
   ```ts
   // Good
   logger.info(
     { userId, action: "login", result: "success" },
     "User logged in",
   );
   // Bad
   logger.info(`User ${userId} logged in`);
   ```
4. **Log request/response in middleware** – Use Express middleware to log incoming requests and outgoing responses with status codes, duration, and any errors.
5. **Use child loggers** – For each request, create a child logger with the `requestId` to easily correlate logs.

### Monitoring Implementation

1. **Health check endpoint** – Implement `/health` that returns `{ status: 'ok', timestamp, services: { db: 'up', cache: 'up' } }`.
2. **Readiness probe** – In Kubernetes, use `/readiness` to indicate when the application is ready to accept traffic.
3. **Liveness probe** – In Kubernetes, use `/live` to indicate the application is still running.
4. **Metrics endpoint** – If using Prometheus, expose `/metrics` with application-specific metrics.
5. **APM integration** – Use Datadog, New Relic, or OpenTelemetry to instrument and monitor application performance. For OpenTelemetry:
   - Use `@opentelemetry/instrumentation-http` for HTTP and Express auto-instrumentation.
   - Use `@opentelemetry/instrumentation-express` for Express routes.
   - Use `@opentelemetry/instrumentation-prisma` for Prisma queries.
   - Export traces to a collector (e.g., Jaeger, Zipkin, or Datadog).

### Log Aggregation

1. **Stream logs to a centralized service** – Use `pino`'s transports to send logs to Datadog, Logtail, AWS CloudWatch, etc.
2. **Use `pino-pretty` for development** – In development, use `pino-pretty` for human-readable output.
3. **Use log rotation** – In production, ensure logs are rotated and archived appropriately.

---

## Anti-Patterns

| Anti-Pattern                        | Why it is wrong                                       | Correct approach                            |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Using `console.log` in production   | No structure, no level, no integration; unmanageable. | Use structured logging with pino/winston.   |
| Logging secrets (passwords, tokens) | Security risk; exposes sensitive data.                | Redact sensitive fields.                    |
| Logging at `info` for everything    | Too much noise; hard to find errors.                  | Use appropriate log levels.                 |
| Not including `requestId`           | Cannot correlate logs from the same request.          | Include `requestId` in every log.           |
| Ignoring error logs                 | Errors go unnoticed; no alerting.                     | Set up alerting for errors.                 |
| Not having health checks            | Cannot detect if application is unhealthy.            | Implement health checks.                    |
| Over-alerting                       | Alert fatigue; important alerts are ignored.          | Set meaningful thresholds and avoid noise.  |
| Logging without context             | No way to know which user or request caused the log.  | Include structured context.                 |
| Not monitoring dependencies         | External service failures go unnoticed.               | Monitor dependency health in health checks. |

---

## Common Mistakes & Edge Cases

| Mistake                                          | Symptom                                | Solution                                               |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------------ |
| Redaction not working                            | Secrets appear in logs.                | Verify redaction paths with sample data; test.         |
| Too many logs at `debug` in production           | Performance degradation.               | Set production log level to `info`.                    |
| Log aggregation failing                          | Logs not streaming to central service. | Check network, credentials, and error logs.            |
| `pino` child logger not propagating context      | Missing `requestId`.                   | Ensure child logger is used correctly.                 |
| Health check failing due to missing dependencies | Application considered unhealthy.      | Be selective; only fail if the dependency is critical. |
| Metrics not exposed on `/metrics`                | Cannot scrape metrics.                 | Ensure Prometheus endpoint is exposed.                 |
| Alerting threshold too low                       | Frequent alerts; fatigue.              | Adjust thresholds based on historical data.            |
| Using `JSON.stringify` on objects manually       | Messy; hard to format.                 | Let the logger handle serialization.                   |

---

## Related Skills

- `express` – for implementing request logging middleware and health checks.
- `security` – for redaction and secure logging.
- `performance` – for performance metrics and monitoring.
- `deployment` – for integrating logging/monitoring into production.
- `docker` – for logging with Docker containers.
- `environment-config` – for configuring log levels via environment variables.
- `testing` – for testing logging and health endpoints.

---

## Official References

- [12 Factor App – Logs](https://12factor.net/logs)
- [Pino Documentation](https://github.com/pinojs/pino)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [Node.js Logging Best Practices](https://nodejs.org/en/docs/guides/logging/)
- [Express – Logging](https://expressjs.com/en/guide/debugging.html)
- [OpenTelemetry Node.js Instrumentation](https://opentelemetry.io/docs/instrumentation/js/)
- [Prometheus Node.js Client](https://github.com/siimon/prom-client)
- [Datadog Node.js APM](https://docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs/)
- [Logtail Node.js](https://docs.logtail.com/languages/node/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [Kubernetes – Liveness and Readiness Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
