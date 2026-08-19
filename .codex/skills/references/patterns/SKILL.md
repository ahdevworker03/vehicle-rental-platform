---
name: patterns
description: Essential software design patterns and architectural patterns for full-stack TypeScript applications, including React component patterns, backend service patterns, data access patterns, state management patterns, monorepo patterns, offline-first patterns, and general software design patterns (creational, structural, behavioral). Applicable when designing application architecture, solving recurring design problems, choosing between pattern alternatives, or communicating architectural decisions.
---

# Patterns

## Purpose

This skill provides a reference of essential software design patterns and architectural patterns relevant to the full-stack TypeScript monorepo. Patterns are proven solutions to recurring design problems that help maintain consistency, readability, and maintainability. The skill covers React component patterns, Express/backend patterns, data patterns, monorepo patterns, offline-first patterns, and general software design patterns. The goal is to guide the agent in selecting and applying the appropriate pattern for a given context.

---

## When to Load

- User is designing application architecture or making architectural decisions.
- User mentions: `pattern`, `design pattern`, `architectural pattern`, `composition`, `inversion of control`, `dependency injection`, `repository`, `service`, `controller`, `HOC`, `render props`, `compound component`.
- User asks about solving recurring design problems or communicating architectural decisions.
- User is evaluating trade-offs between different approaches to a problem.
- User is implementing a pattern or refactoring to follow a pattern.

---

## When NOT to Load

- Writing simple utility functions or single-component features.
- General bug fixing or debugging without design considerations.
- Infrastructure or deployment configuration (unless pattern-related).
- Technology-specific implementation without architectural context.

---

## Core Principles

1. **Patterns Are Guidelines, Not Rules** – Patterns provide solutions to common problems but must be adapted to context. Apply patterns judiciously, not dogmatically.
2. **Prefer Simplicity** – The simplest solution that works is often the best. Only introduce patterns when they reduce complexity or improve maintainability.
3. **Patterns Communicate Intent** – Using well-known patterns makes code more understandable to other developers. The name of the pattern conveys the design intent.
4. **Patterns Evolve** – Patterns are not static; they evolve with technology and best practices. Use modern implementations of patterns (e.g., hooks instead of HOCs in React).
5. **Patterns Have Trade-offs** – Every pattern has benefits and costs. Choose the pattern that balances maintainability, performance, and readability for your specific use case.

---

## Architectural Patterns

### MVC (Model-View-Controller)

- **When to Use**: When you need to separate business logic from UI rendering and user input.
- **Context**: Backend Express applications or full-stack architectures.
- **Structure**:
  - **Model**: Data and business logic (Prisma models, service layer)
  - **View**: Presentation layer (React components or API response formatting)
  - **Controller**: Handles user input, orchestrates model and view (Express route handlers)
- **Implementation**:
  - Route handlers act as controllers
  - Service modules contain business logic (models)
  - React components are views
- **Trade-offs**: Clear separation of concerns, but can add complexity for simple applications.

### Repository Pattern

- **When to Use**: When you need to abstract data access logic from business logic.
- **Context**: Backend with databases (PostgreSQL/Prisma).
- **Structure**:
  - Repository modules that encapsulate data access (CRUD operations)
  - Services use repositories to interact with data
- **Implementation**:
  - Create `repositories/` directory with functions like `findUserById`, `createPost`
  - Use Prisma inside repositories; services only call repositories
  - Services handle business logic; repositories handle data access
- **Trade-offs**: Decouples data access from business logic, making it easier to switch databases or mock tests. Adds an abstraction layer.

### Service Layer Pattern

- **When to Use**: When you need to separate business logic from route handlers.
- **Context**: Backend API development.
- **Structure**:
  - Services contain the core business logic
  - Controllers (routes) call services
  - Services call repositories for data access
- **Implementation**:
  - Create `services/` directory with modules like `user.service.ts`, `order.service.ts`
  - Each service exports functions that handle business logic
  - Route handlers import and call service functions
- **Trade-offs**: Keeps routes thin and testable, but adds an extra layer of abstraction.

### Dependency Injection (DI) / Inversion of Control (IoC)

- **When to Use**: When you need to decouple dependencies for testability or flexibility.
- **Context**: Services, middleware, or modules that depend on external services.
- **Structure**:
  - Dependencies are passed in (injected) rather than hard-coded
- **Implementation**:
  - Instead of importing a repository or service directly, pass it as a parameter
  - Use factory functions or class constructors that accept dependencies
  - Example: `const userService = (prisma: PrismaClient) => ({ findUser: ... })`
  - In tests, pass mock dependencies
- **Trade-offs**: Increases flexibility and testability, but can make code more complex to trace.

### Observer Pattern

- **When to Use**: When you need to broadcast state changes to multiple subscribers (e.g., event-driven architecture).
- **Context**: Event handling, real-time updates, or reactive programming.
- **Implementation**:
  - Use Node.js `EventEmitter` for custom events.
  - In React, use custom hooks or Context for broadcast.
  - In Prisma, use middleware to trigger side effects.
  - In PostgreSQL, use `LISTEN/NOTIFY` for database events.
- **Trade-offs**: Decouples components but can make flow harder to trace.

### MVC with Services (Recommended for Express Apps)

```
┌─────────────────────────────────────────────────────────┐
│                       Client                           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Express Route (Controller)                 │
│  - Receives request                                     │
│  - Validates input                                      │
│  - Calls service(s)                                     │
│  - Formats response                                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                         │
│  - Contains business logic                              │
│  - Orchestrates multiple repositories                   │
│  - Handles transactions                                 │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                Repository Layer                         │
│  - Encapsulates data access (Prisma)                   │
│  - Single responsibility: CRUD operations               │
│  - Returns domain objects                               │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend (React) Patterns

### Component Composition

- **When to Use**: As the primary way to build UIs. Composition over inheritance.
- **Structure**: Build complex UIs by composing smaller, focused components.
- **Implementation**:
  ```tsx
  // Instead of a monolithic component
  const Dashboard = () => (
    <Container>
      <Header>
        <Logo />
        <Navigation />
      </Header>
      <Content>
        <Sidebar />
        <MainArea>
          <DataTable />
          <Stats />
        </MainArea>
      </Content>
    </Container>
  );
  ```
- **Trade-offs**: Highly reusable and maintainable; each component has a single responsibility.

### Container/Presentational Pattern (Smart/Dumb Components)

- **When to Use**: To separate data fetching and state management from presentation logic.
- **Context**: React components that fetch or manage data.
- **Structure**:
  - Presentational components: Receive data via props, render UI, no logic.
  - Container components: Fetch data, manage state, pass data to presentational components.
- **Implementation** (with hooks):
  - Presentational: `UserProfile({ user })`
  - Container: `UserProfileContainer` uses `useQuery`/`useState` and renders `UserProfile`
- **Trade-offs**: Separation of concerns; easier testing. More files to manage.

### Custom Hooks

- **When to Use**: To extract and reuse stateful logic across multiple components.
- **Structure**: A function prefixed with `use` that encapsulates state and effects.
- **Implementation**:
  ```ts
  const useFetch = <T>(url: string) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      fetch(url)
        .then((res) => res.json())
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error };
  };
  ```
- **Trade-offs**: Promotes reusability; makes components cleaner. Can be overused if logic is not truly shared.

### Compound Components

- **When to Use**: When you need a parent component that controls child components with shared state.
- **Context**: Dropdowns, accordions, tabs, and other UI patterns with a parent-child relationship.
- **Structure**:
  - Parent component provides shared state via Context
  - Child components consume the context
- **Implementation**:
  ```tsx
  const Tabs = ({ children, initialTab }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div>{children}</div>
      </TabsContext.Provider>
    );
  };

  const Tab = ({ children, id }) => {
    const { activeTab, setActiveTab } = useContext(TabsContext);
    return <button onClick={() => setActiveTab(id)}>{children}</button>;
  };

  const TabPanel = ({ children, id }) => {
    const { activeTab } = useContext(TabsContext);
    return activeTab === id ? <div>{children}</div> : null;
  };
  ```
- **Trade-offs**: Highly flexible; children can be arranged in any order. Requires Context and can be complex to implement.

### Render Props / Function as Children

- **When to Use**: To share logic by passing a function that renders content (less common since hooks).
- **Context**: Legacy codebases or specific use cases (e.g., `useForm` with children).
- **Implementation**:
  ```tsx
  const DataFetcher = ({ url, children }) => {
    const [data, setData] = useState(null);
    // ... fetch logic
    return children(data);
  };

  // Usage
  <DataFetcher url="/api/users">
    {(data) => <UserList users={data} />}
  </DataFetcher>;
  ```
- **Trade-offs**: Can lead to "pyramid of doom" with nested render props. Hooks are often preferred.

### Controlled vs Uncontrolled Components

- **When to Use**: To decide whether React state or DOM state controls the component.
- **Context**: Form inputs, toggles, and user input components.
- **Structure**:
  - Controlled: Value stored in React state; updates via `onChange` handler
  - Uncontrolled: Value stored in DOM; use `ref` to read value
- **Implementation**:
  ```tsx
  // Controlled
  const ControlledInput = () => {
    const [value, setValue] = useState("");
    return <input value={value} onChange={(e) => setValue(e.target.value)} />;
  };

  // Uncontrolled
  const UncontrolledInput = () => {
    const ref = useRef<HTMLInputElement>(null);
    return <input defaultValue="" ref={ref} />;
  };
  ```
- **Trade-offs**: Controlled gives full control but more boilerplate; uncontrolled is simpler but less flexible.

### Higher-Order Components (HOC)

- **When to Use**: To add functionality to a component (less common since hooks).
- **Context**: Legacy codebases or specific cross-cutting concerns (e.g., authentication, logging).
- **Structure**: A function that takes a component and returns an enhanced component.
- **Implementation**:
  ```tsx
  const withAuthentication = (Component) => {
    return (props) => {
      const user = useAuth();
      return user ? <Component {...props} user={user} /> : <Login />;
    };
  };

  const Profile = ({ user }) => <div>Hello {user.name}</div>;
  const ProtectedProfile = withAuthentication(Profile);
  ```
- **Trade-offs**: Flexible but can create "wrapper hell" and make debugging harder. Hooks are preferred for most use cases.

### Provider Pattern (Context)

- **When to Use**: To share global state or configuration across a component tree.
- **Context**: Theming, authentication, localization, and global state.
- **Structure**:
  - Provider component holds state and provides it via Context
  - Consumer components access the state via `useContext`
- **Implementation**:
  ```tsx
  const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

  const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");
    const toggleTheme = () =>
      setTheme((t) => (t === "light" ? "dark" : "light"));
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  ```
- **Trade-offs**: Effective for coarse-grained data; can cause re-renders if used for high-frequency updates. Use selectors or memoization to optimize.

---

## Backend (Express/Node.js) Patterns

### Middleware Pattern

- **When to Use**: To handle cross-cutting concerns in the request-response cycle.
- **Context**: Authentication, logging, validation, error handling, compression.
- **Structure**: Functions that receive `(req, res, next)` and either respond or call `next()`.
- **Implementation**:
  ```ts
  const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  };

  const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    req.user = verifyToken(token);
    next();
  };
  ```
- **Trade-offs**: Highly composable; can become unwieldy with too many middlewares.

### Factory Pattern

- **When to Use**: When you need to create objects or functions with a consistent interface.
- **Context**: Creating services, clients, or configuration objects.
- **Implementation**:
  ```ts
  const createUserService = (prisma: PrismaClient) => ({
    async findUserById(id: string) {
      return prisma.user.findUnique({ where: { id } });
    },
    async createUser(data: CreateUserInput) {
      return prisma.user.create({ data });
    },
  });
  ```
- **Trade-offs**: Encapsulates construction logic; makes dependency injection easier.

### Singleton Pattern

- **When to Use**: When exactly one instance of a resource is needed.
- **Context**: Database connections (`PrismaClient`), configuration, logging.
- **Implementation**:
  ```ts
  // Single PrismaClient instance
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  export const prisma = globalForPrisma.prisma || new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```
- **Trade-offs**: Ensures a single instance; can make testing harder. Use dependency injection to improve testability.

### Strategy Pattern

- **When to Use**: When you need to select between different algorithms or behaviors at runtime.
- **Context**: Authentication strategies, payment gateways, file storage providers.
- **Implementation**:
  ```ts
  type AuthStrategy = (credentials) => Promise<User>;

  const localStrategy: AuthStrategy = async ({ email, password }) => {
    // Validate email/password
  };

  const googleStrategy: AuthStrategy = async ({ token }) => {
    // Validate OAuth token
  };

  const authenticate = (strategy: AuthStrategy) => async (req, res, next) => {
    const user = await strategy(req.body);
    // ...
  };
  ```
- **Trade-offs**: Flexible and extensible; adds complexity for simple use cases.

### Builder Pattern

- **When to Use**: When constructing complex objects with many optional parameters.
- **Context**: Configuration objects, complex service initialization, or query building.
- **Implementation**:
  ```ts
  const buildQuery = () => ({
    _filters: {},
    withFilter(field, value) {
      this._filters[field] = value;
      return this;
    },
    build() {
      return { where: this._filters };
    },
  });
  ```
- **Trade-offs**: Improves readability for complex construction; can be overkill for simple objects.

### Adapter Pattern

- **When to Use**: When you need to make an existing interface compatible with another.
- **Context**: Integrating third-party services, external APIs, or legacy code.
- **Implementation**:
  ```ts
  // External API client (different interface)
  const externalClient = { sendRequest: (endpoint, data) => ... };

  // Adapter to match our interface
  const adapter = {
    async getUser(id) {
      return externalClient.sendRequest(`/users/${id}`, {});
    }
  };
  ```
- **Trade-offs**: Decouples our code from external dependencies; adds an abstraction layer.

---

## Data Access Patterns

### Active Record vs Data Mapper

- **When to Use**: To decide how models interact with the database.
- **Context**: ORM design choices.
- **Structure**:
  - Active Record: Model objects have direct CRUD methods (`user.save()`)
  - Data Mapper: Separate repository layer handles persistence (`userRepo.save(user)`)
- **Trade-offs**:
  - Active Record is simpler but couples domain logic to persistence.
  - Data Mapper decouples domain from persistence but adds complexity.

### Unit of Work

- **When to Use**: To maintain a list of objects affected by a business transaction and coordinate writes.
- **Context**: Complex operations involving multiple repositories.
- **Implementation**:
  - Use Prisma transactions (`$transaction`) to group multiple operations
  - All operations in the transaction either succeed or fail together
- **Trade-offs**: Ensures consistency but can be slower if overused.

### CQRS (Command Query Responsibility Segregation)

- **When to Use**: When read and write workloads have different requirements.
- **Context**: Complex, high-volume applications with distinct read and write models.
- **Structure**:
  - Commands: Write operations (create, update, delete)
  - Queries: Read operations (fetch, search)
- **Trade-offs**: More complex but allows independent optimization.

### Event Sourcing

- **When to Use**: When you need full audit trail and the ability to reconstruct state.
- **Context**: Financial systems, audit logs, and complex event-driven architectures.
- **Structure**: Store events, not current state. Rebuild state by replaying events.
- **Trade-offs**: Highly durable and auditable; very complex to implement.

---

## Monorepo Patterns

### Dependency Management with Workspace Protocols

- **When to Use**: To manage internal package dependencies.
- **Context**: Monorepo with multiple packages.
- **Implementation**:
  ```json
  // In package.json of a dependent package
  {
    "dependencies": {
      "@repo/types": "workspace:*",
      "@repo/ui": "workspace:^"
    }
  }
  ```
- **Trade-offs**: Ensures packages stay in sync; uses local versions.

### Feature-Based Structure

- **When to Use**: To organize code by feature rather than by technology.
- **Context**: Monorepo with multiple applications and shared packages.
- **Structure**:
  ```
  apps/
    ├── web/          # Frontend app
    ├── api/          # Backend app
    └── admin/        # Admin dashboard
  packages/
    ├── shared/       # Shared utilities
    ├── types/        # Shared TypeScript types
    ├── ui/           # Shared UI components
    └── config/       # Shared configurations (ESLint, TS, etc.)
  ```
- **Trade-offs**: Scalable and clear; can be harder to maintain cross-cutting concerns.

### Code Sharing via Packages

- **When to Use**: To share code across multiple applications.
- **Context**: Type definitions, validation schemas, UI components, utility functions.
- **Implementation**:
  - Create dedicated packages for shared code
  - Use workspace protocols to reference them
  - Each package should be focused and have a single responsibility
- **Trade-offs**: Reduces duplication; adds package management overhead.

### Multi-App Deployment with `turbo prune`

- **When to Use**: To deploy only the necessary files for an application.
- **Context**: Deploying from a monorepo.
- **Implementation**:
  ```bash
  # In CI/CD
  npx turbo prune --scope=web --docker
  ```
  - Only the `web` app and its dependencies are copied
- **Trade-offs**: Reduces deployment size; requires Turborepo.

---

## Offline-First Patterns

### Repository Pattern with Sync Engine

- **When to Use**: To abstract local vs remote data access.
- **Context**: Offline-first applications.
- **Implementation**:
  - Repository combines local and remote data sources
  - Read: Check local storage first
  - Write: Write to local storage, then queue for sync
- **Trade-offs**: Single access point; but all functionality is more complex.

### Queue-Based Mutation Pattern

- **When to Use**: To persist mutations when offline and replay them when online.
- **Context**: All write operations.
- **Implementation**:
  - Queue stores mutations (operation type, data, timestamp)
  - When online, process queue in order
  - Mark processed mutations as synced
- **Trade-offs**: Ensures eventual consistency; can have conflicts.

### Optimistic Update Pattern

- **When to Use**: To improve perceived performance.
- **Context**: Any user-triggered mutation.
- **Implementation**:
  - Update UI immediately
  - Store previous state for rollback
  - Send mutation to server
  - On success, keep update; on error, rollback
- **Trade-offs**: Responsive UI; risk of inconsistency if rollback fails.

### Conflict Resolution Strategies

- **When to Use**: When data is modified offline and conflicts with server data.
- **Implementation**:
  - **Last Write Wins**: Compare timestamps; latest wins
  - **CRDTs (Conflict-Free Replicated Data Types)**: Use mathematical structures that merge deterministically
  - **Custom Resolutions**: Domain-specific rules (e.g., admin overrides user)
- **Trade-offs**: LWW is simple but loses data; CRDTs preserve data but are complex.

---

## General Software Design Patterns

### Creational Patterns

| Pattern       | Use Case                               | Implementation                |
| ------------- | -------------------------------------- | ----------------------------- |
| **Singleton** | Single instance required               | `PrismaClient` instance       |
| **Factory**   | Creating objects with shared interface | `createUserService()`         |
| **Builder**   | Complex object construction            | Query builder, config builder |
| **Prototype** | Copying existing objects               | Less common in TypeScript     |

### Structural Patterns

| Pattern       | Use Case                                  | Implementation                      |
| ------------- | ----------------------------------------- | ----------------------------------- |
| **Adapter**   | Bridging incompatible interfaces          | Third-party API integration         |
| **Decorator** | Adding behavior without modifying code    | Higher-order components, middleware |
| **Composite** | Tree structures                           | UI component trees, render trees    |
| **Facade**    | Simplified interface to complex subsystem | Service layer                       |
| **Proxy**     | Controlling access to object              | Lazy loading, caching               |

### Behavioral Patterns

| Pattern                     | Use Case                               | Implementation                      |
| --------------------------- | -------------------------------------- | ----------------------------------- |
| **Observer**                | One-to-many state change notifications | EventEmitter, Context               |
| **Strategy**                | Interchangeable algorithms             | Authentication strategies           |
| **Command**                 | Encapsulating requests as objects      | Mutation queue in offline-first     |
| **Chain of Responsibility** | Passing requests along a chain         | Express middleware pipeline         |
| **Template Method**         | Algorithm with customizable steps      | Base class with overridable methods |
| **Iterator**                | Traversing collections                 | Iterators, generators               |

---

## Anti-Patterns to Avoid

| Anti-Pattern                 | Why it is wrong                                        | Correct approach                              |
| ---------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| **God Object**               | Single object knows/does too much; violates SRP.       | Split into focused modules.                   |
| **Spaghetti Code**           | Unstructured flow; hard to follow.                     | Use patterns to organize.                     |
| **Copy-Paste Programming**   | Duplication creates maintenance burden.                | Extract shared code.                          |
| **Golden Hammer**            | Applying the same pattern to everything.               | Choose appropriate patterns for each context. |
| **Premature Generalization** | Over-engineering for hypothetical future needs.        | Keep simple; refactor when needed.            |
| **Ship of Theseus**          | Refactoring parts without changing the name/interface. | Refactor intentionally; maintain coherence.   |

---

## Related Skills

- `architecture/monorepo` – for monorepo-specific patterns.
- `architecture/offline-first` – for offline-first patterns.
- `frontend/react` – for React component patterns.
- `backend/express` – for Express/Node.js patterns.
- `database/prisma` – for data access patterns.
- `references/checklists` – for pattern selection checklists.
- `quality/refactoring` – for introducing patterns through refactoring.

---

## Official References

- [React Official Patterns – Composition vs Inheritance](https://react.dev/learn/composition-vs-inheritance)
- [React Patterns – Render Props vs HOCs vs Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Express Middleware Pattern](https://expressjs.com/en/guide/using-middleware.html)
- [Martin Fowler – Patterns of Enterprise Application Architecture](https://martinfowler.com/eaaCatalog/)
- [Martin Fowler – Refactoring Catalog](https://refactoring.com/catalog/)
- [Design Patterns – Gamma, Helm, Johnson, Vlissides (GoF)](https://en.wikipedia.org/wiki/Design_Patterns)
- [Refactoring Guru – Design Patterns Catalog](https://refactoring.guru/design-patterns)
- [Prisma – Repository Pattern](https://www.prisma.io/docs/orm/overview/prisma-in-your-stack/prisma-code-review-best-practices#repository-pattern)
- [Monorepo.tools – Patterns for Monorepos](https://monorepo.tools/)
- [Offline First – Patterns](https://offlinefirst.org/)
