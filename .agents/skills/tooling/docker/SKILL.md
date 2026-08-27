---
name: docker
description: Docker work for this repo, especially `apps/api/Dockerfile` and `apps/api/docker-compose.yml`, plus containerizing the backend and supporting services. Applicable when containerizing applications, writing Dockerfiles, configuring Docker Compose, optimizing image size, or implementing container security best practices.
---

# Docker

## Purpose

This skill guides the agent in containerizing applications using Docker following official Docker best practices. Containerization packages applications with their dependencies, configuration, and runtime into portable units that behave consistently across environments. The skill covers Dockerfile authoring, multi-stage builds, layer optimization, security hardening, resource management, health checks, Docker Compose, and vulnerability scanning.

---

## When to Load

- User is writing, reviewing, or optimizing Dockerfiles.
- User mentions: `Docker`, `Dockerfile`, `container`, `image`, `build`, `docker-compose`, `compose.yaml`, `multi-stage`, `dockerignore`, `Docker Scout`, `containerize`.
- User is containerizing applications for development or production.
- User asks about optimizing image size, security, or Docker Compose configuration.
- User is setting up Docker for local development environments.

---

## When NOT to Load

- General application code development without containerization.
- Kubernetes or orchestration configuration (see orchestration skills).
- Infrastructure or CI/CD configuration not directly related to Docker.
- Database schema or application code design.

---

## Core Principles

1. **Ephemeral Containers** – Containers should be disposable and replaceable. Data that must persist should use volumes, not be stored inside the container.
2. **Minimal Base Images** – Use the smallest base image that meets requirements to reduce size and attack surface. Docker Official Images are trusted starting points.
3. **Multi-Stage Builds** – Separate build dependencies from runtime dependencies to minimize final image size.
4. **Layer Caching** – Order Dockerfile instructions from least to most frequently changing to maximize cache reuse.
5. **Security by Default** – Run as non-root user, use minimal base images, scan for vulnerabilities, and never embed secrets in images.
6. **Resource Constraints** – Always set memory and CPU limits on containers in production to prevent resource exhaustion.
7. **Health Checks** – Implement health checks to enable automatic recovery of unhealthy containers.

---

## Decision Rules

### Base Image Selection

- **IF** you need to run a Node.js application, **THEN** choose `node:<version>-alpine` for minimal size, or `node:<version>-slim` for a balance of size and compatibility.
- **IF** you need a production image with enhanced security, **THEN** consider Docker Hardened Images (DHI) which are minimal and secure.
- **IF** you need a base image for multiple stages, **THEN** use a full image with build tools for the build stage and a slim image for the runtime stage.
- **ALWAYS** use images from trusted sources:
  - **Docker Official Images** – Curated, well-documented, regularly updated
  - **Docker Verified Publisher Images** – Authenticated content from partner organizations
  - **Docker-Sponsored Open Source Images** – Published by open source projects

### Multi-Stage Builds

- **IF** your application requires build tools (TypeScript compiler, bundler, package manager), **THEN** use multi-stage builds to separate build and runtime stages.
- **IF** you have multiple related images, **THEN** create a reusable common stage to avoid duplication.
- **IF** building for production, **THEN** use a slim or minimal base image for the final stage.
- **ALWAYS** copy only production dependencies (`npm ci --omit=dev`) into the final stage, not development dependencies.

### Layer Ordering and Caching

- **IF** installing dependencies, **THEN** copy `package.json` and `package-lock.json` before copying source code. This caches the dependency layer.
- **IF** running commands that produce temporary files, **THEN** combine them in a single `RUN` instruction and clean up in the same layer to avoid bloating the image.
- **IF** copying files that change frequently (source code), **THEN** place the `COPY` instruction after dependency installation.
- **ALWAYS** use `--pull` flag when building to get fresh base images with latest security patches.

### .dockerignore

- **ALWAYS** use a `.dockerignore` file to exclude unnecessary files from the build context.
- **Include in `.dockerignore`**: `node_modules`, `dist`, `build`, `.git`, `.env`, `*.log`, `coverage`, `.next`, `.turbo`, `Dockerfile`, `.dockerignore`.
- **DO NOT** exclude `.dockerignore` itself from the build context.

### Security Hardening

- **IF** the container runs a service, **THEN** create and switch to a non-root user:
  ```dockerfile
  RUN addgroup --system app && adduser --system --ingroup app app
  USER app
  ```
- **IF** using a base image, **THEN** use Docker Official Images as a trusted starting point.
- **IF** building for production, **THEN** scan images for vulnerabilities using Docker Scout:
  ```bash
  docker scout quickview <image>
  docker scout cves <image>
  ```
- **ALWAYS** use `--pull` flag to ensure base image security patches are applied.
- **NEVER** embed secrets (API keys, passwords, tokens) in images.

### Health Checks

- **IF** the container runs a service that should be monitored, **THEN** add a `HEALTHCHECK` instruction:
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
  ```
- **IF** using Docker Compose, **THEN** add `healthcheck` block to services.
- **ALWAYS** ensure the health check command uses tools available in the image (`curl`, `wget`, or Node.js script).
- **DO NOT** add more than one `HEALTHCHECK` instruction in a Dockerfile – only the last is respected.

### Resource Limits

- **ALWAYS** set memory and CPU limits in production:
  ```yaml
  services:
    app:
      deploy:
        resources:
          limits:
            memory: 512M
            cpus: "0.5"
          reservations:
            memory: 256M
            cpus: "0.25"
  ```
- **IF** using `docker run`, **THEN** use `--memory` and `--cpus` flags.
- **IF** memory usage is unpredictable, **THEN** use both hard limits (cap) and reservations (guaranteed).

---

## Best Practices

### Dockerfile Structure

1. **Use `syntax=docker/dockerfile:1`** – Specifies the Dockerfile syntax version and ensures up-to-date features.
2. **Combine `RUN` commands** – Use `&&` to chain commands and `\` for line continuation to reduce layers.
3. **Clean up in the same layer** – After installing packages, clean package manager caches in the same `RUN` instruction.
4. **Use `WORKDIR`** – Sets the working directory for all subsequent instructions.
5. **Use `CMD` or `ENTRYPOINT`** – Each Dockerfile should have exactly one `CMD` or `ENTRYPOINT`.
6. **Prefer `COPY` over `ADD`** – `COPY` is more predictable; `ADD` has extra features (URLs, auto-tar extraction) that are rarely needed.

### Docker Compose

1. **Use separate Compose files for development and production** – Use `compose.yaml` for development and `compose.production.yaml` for production overrides.
2. **Remove volume bindings for application code in production** – Application code should be inside the container, not mounted from the host.
3. **Use environment variables** – Never hardcode sensitive information. Use `${VARIABLE}` interpolation or `.env` files.
4. **Set restart policy** – Use `restart: always` or `restart: unless-stopped` for production services.
5. **Use the `--no-deps` flag when redeploying** – When updating a service, use `docker compose up --no-deps -d <service>` to avoid recreating dependent services.

### Image Optimization

1. **Use multi-stage builds** – Reduces final image size by separating build and runtime environments.
2. **Choose appropriate base images** – Alpine (`node:18-alpine`) or slim (`node:18-slim`) variants for minimal size.
3. **Order layers for cache efficiency** – Copy dependency manifests (`package.json`, `package-lock.json`) before copying source code.
4. **Use `.dockerignore`** – Exclude `node_modules`, `.git`, `*.log`, `dist`, and other unnecessary files.
5. **Clean package manager caches** – Run `apt-get clean` or `npm cache clean --force` in the same `RUN` instruction.
6. **Avoid `curl` or `wget` for basic operations** – Use package managers (`apt`, `apk`) where possible to leverage layer caching.

### Security Scanning

1. **Scan images before deployment** – Use Docker Scout to identify vulnerabilities:
   ```bash
   docker scout quickview <image>
   docker scout cves <image>
   ```
2. **Integrate scanning into CI/CD** – Automatically verify images remain vulnerability-free during the build process.
3. **Use Docker Hardened Images for production** – These are minimal, secure images maintained by Docker.
4. **Run as non-root user** – Create a dedicated user and switch to it.
5. **Use seccomp profiles** – Docker provides a sane default seccomp profile that disables ~44 system calls out of 300+.

---

## Anti-Patterns

| Anti-Pattern                                      | Why it is wrong                                                 | Correct approach                                 |
| ------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| Using `latest` tag for base images                | Unpredictable; may break builds or introduce vulnerabilities.   | Pin specific versions (e.g., `node:18-alpine`).  |
| Storing data inside containers                    | Data lost on container restart; violates ephemeral principle.   | Use volumes or bind mounts.                      |
| Running as root user                              | Security risk; container escape can compromise host.            | Create and use non-root user.                    |
| Embedding secrets in images                       | Secrets exposed; cannot be rotated.                             | Use environment variables or secrets management. |
| Not setting resource limits                       | Container can consume all host resources.                       | Always set memory and CPU limits.                |
| Using `ADD` for local files                       | Adds unnecessary complexity; extra features rarely needed.      | Use `COPY` for local files.                      |
| Installing development dependencies in production | Bloat images and increases attack surface.                      | Use `npm ci --omit=dev` or multi-stage builds.   |
| Not using `.dockerignore`                         | Large build context; slower builds; unnecessary files in image. | Always use `.dockerignore`.                      |
| Multiple `HEALTHCHECK` instructions               | Only the last one is respected.                                 | Include only one `HEALTHCHECK`.                  |
| Not rebuilding images regularly                   | Security patches and updates are missed.                        | Rebuild images regularly; use `--pull`.          |

---

## Common Mistakes & Edge Cases

| Mistake                                        | Symptom                                                              | Solution                                               |
| ---------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| Forgetting `.dockerignore`                     | Build context includes `node_modules`; slow builds and large images. | Create `.dockerignore` with standard exclusions.       |
| Not using `--pull` flag                        | Image built with outdated base image layers.                         | Use `docker build --pull ...`.                         |
| `npm install` vs `npm ci`                      | `npm install` may update lockfile; inconsistent builds.              | Use `npm ci` in production for deterministic builds.   |
| Health check failing due to missing `curl`     | `HEALTHCHECK` fails because `curl` not installed.                    | Use `wget` or Node.js script; install only if needed.  |
| Ownership issues with `COPY`                   | Files owned by root; cannot write.                                   | Use `COPY --chown=app:app ...`.                        |
| Docker Compose environment variable precedence | Variables defined in multiple places; unexpected values.             | Understand precedence: `environment` > shell > `.env`. |
| Volume bind mounts in production               | Application code can be modified from outside.                       | Remove volume bind mounts in production Compose file.  |
| Not using `--no-deps` for updates              | Recreates dependent services; unexpected downtime.                   | Use `--no-deps` when updating a single service.        |
| Cache invalidation on source changes           | Build cache invalidated too early; slow builds.                      | Copy dependency files before copying source code.      |
| Multiple `FROM` without `AS`                   | Unclear stage naming; harder to maintain.                            | Use `AS <stage-name>` for all stages.                  |

---

## Related Skills

- `deployment` – for integrating Docker into deployment pipelines.
- `github-actions` – for building and pushing Docker images in CI/CD.
- `security` – for comprehensive security considerations.
- `performance` – for container performance optimization.
- `logging-monitoring` – for container health monitoring and logging.
- `testing` – for testing containerized applications.

---

## Official References

- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)
- [Building Best Practices](https://docs.docker.com/build/building/best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Dockerfile Overview](https://docs.docker.com/build/concepts/dockerfile/)
- [Docker Official Images](https://hub.docker.com/search?badges=official)
- [Use Compose in Production](https://docs.docker.com/compose/how-tos/production/)
- [Containerize a Node.js Application](https://docs.docker.com/guides/nodejs/containerize/)
- [Docker Scout Documentation](https://docs.docker.com/scout/)
- [Docker Security – Seccomp Profiles](https://docs.docker.com/engine/security/seccomp/)
- [Base Image Hardening](https://docs.docker.com/security/base-image-hardening/)
- [Docker Healthcheck Reference](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Resource Limits](https://docs.docker.com/engine/containers/resource_constraints/)
- [Environment Variables in Compose](https://docs.docker.com/compose/how-tos/environment-variables/envvars/)
- [Dockerfile Security Best Practices](https://docs.docker.com/develop/develop-images/security-best-practices/)
- [Minimal or Distroless Images](https://docs.docker.com/security/minimal-and-distroless-images/)
