---
name: templates
description: Ready-to-use code templates and boilerplates for common development tasks, including Express route handlers, React components, service modules, repository modules, Prisma schema definitions, API request/response types, monorepo package configurations, custom hooks, and validation schemas. Applicable when implementing common patterns, starting new features, or maintaining consistency across the codebase.
---

# Templates

## Purpose

This skill provides a comprehensive set of code templates and boilerplates for common development tasks across the full stack. Templates ensure consistency, reduce boilerplate, and accelerate development by providing proven starting points. Each template follows best practices from official documentation and incorporates the patterns defined in this skill library. The goal is to provide production-quality starting points that can be adapted to specific needs.

---

## When to Load

- User is implementing a new feature, component, or module.
- User mentions: `template`, `boilerplate`, `starter`, `scaffold`, `structure`, `example`, `skeleton`.
- User asks about the recommended structure for a component, route, service, or module.
- User is setting up a new package, application, or configuration file.
- User wants to ensure consistency with established patterns.

---

## When NOT to Load

- Fixing bugs or debugging existing code.
- General planning or architecture design without implementation.
- Infrastructure or deployment configuration.
- Code review without implementation context.

---

## Template Principles

1. **Production-Ready** – Templates include error handling, logging, type safety, and testing considerations.
2. **Documented** – Templates include comments explaining key decisions and usage.
3. **Consistent** – Templates follow the same patterns, naming conventions, and file structure across the codebase.
4. **Adaptable** – Templates are starting points; modify them to fit specific requirements.
5. **Complete** – Templates include imports, exports, types, and all necessary parts to function.

---

## Backend Templates

### Express Route Handler (with Validation and Service)

```ts
// src/routes/users.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { userService } from "../services/user.service";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

// Validation schemas
const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    password: z.string().min(8),
  }),
});

const GetUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// GET /users/:id
router.get(
  "/:id",
  validateRequest(GetUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        return res.status(404).json({
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
        });
      }

      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },
);

// POST /users
router.post(
  "/",
  validateRequest(CreateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.create(req.body);
      res.status(201).json({ data: user });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
```

### Service Module

```ts
// src/services/user.service.ts
import { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { CreateUserInput, UpdateUserInput } from "../types/user.types";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

// Singleton instance
export const userService = new UserService(prisma);
```

### Repository Module (with Prisma)

```ts
// src/repositories/user.repository.ts
import { PrismaClient, User } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findUnique(where: { id?: string; email?: string }) {
    return this.prisma.user.findUnique({ where });
  }

  async findMany(options?: {
    skip?: number;
    take?: number;
    where?: Partial<User>;
    orderBy?: { [key: string]: "asc" | "desc" };
  }) {
    return this.prisma.user.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      orderBy: options?.orderBy,
    });
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">) {
    return this.prisma.user.create({ data });
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async count(where?: Partial<User>) {
    return this.prisma.user.count({ where });
  }
}

export const userRepository = new UserRepository(prisma);
```

### Validation Middleware

```ts
// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors.reduce(
              (acc, err) => {
                const path = err.path.join(".");
                if (!acc[path]) {
                  acc[path] = [];
                }
                acc[path].push(err.message);
                return acc;
              },
              {} as Record<string, string[]>,
            ),
          },
        });
      }
      next(error);
    }
  };
};
```

### Error Handler Middleware

```ts
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export class AppError extends Error {
  status: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Log error
  console.error(`[${req.method}] ${req.url} - ${err.message}`);
  console.error(err.stack);

  // Handle known error types
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.errors,
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma specific errors
    if (err.code === "P2002") {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_RESOURCE",
          message: `A record with this ${err.meta?.target} already exists.`,
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Record not found.",
        },
      });
    }
  }

  if (err instanceof AppError) {
    const status = err.status || 500;
    const message = status === 500 ? "Internal server error" : err.message;
    return res.status(status).json({
      error: {
        code: err.code,
        message,
      },
    });
  }

  // Unknown errors
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
};
```

### App Entry Point

```ts
// src/index.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { errorHandler } from "./middleware/error.middleware";
import { logger } from "./lib/logger";
import routes from "./routes";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origins }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/v1", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.env} mode`);
});

export default app;
```

### Configuration Module

```ts
// src/config/index.ts
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "PORT"] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
} as const;
```

---

## Frontend Templates

### React Component (with TypeScript and Tailwind)

```tsx
// src/components/ui/Button/Button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading, children, disabled, ...props },
    ref,
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
```

### Custom Hook Template

```ts
// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Data Fetching Hook (with React Query)

```ts
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { User, CreateUserInput, UpdateUserInput } from "../types/user.types";

// Query keys
const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// GET all users
export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...userKeys.all, params],
    queryFn: () => api.getUsers(params),
  });
}

// GET single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.getUser(id),
    enabled: !!id,
  });
}

// CREATE user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => api.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// UPDATE user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      api.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// DELETE user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
```

### API Client Module

```ts
// src/lib/api.ts
import axios, { AxiosInstance, AxiosError } from "axios";
import { User, CreateUserInput, UpdateUserInput } from "../types/user.types";

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        const responseData = error.response?.data as any;
        const message = responseData?.error?.message || error.message;
        return Promise.reject(new Error(message));
      },
    );
  }

  // Auth
  async login(email: string, password: string) {
    return this.client.post("/auth/login", { email, password });
  }

  async logout() {
    return this.client.post("/auth/logout");
  }

  async refreshToken(refreshToken: string) {
    return this.client.post("/auth/refresh", { refreshToken });
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number }) {
    return this.client.get("/users", { params });
  }

  async getUser(id: string) {
    return this.client.get(`/users/${id}`);
  }

  async createUser(data: CreateUserInput) {
    return this.client.post("/users", data);
  }

  async updateUser(id: string, data: UpdateUserInput) {
    return this.client.patch(`/users/${id}`, data);
  }

  async deleteUser(id: string) {
    return this.client.delete(`/users/${id}`);
  }
}

export const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL || "/api/v1");
```

### Type Definitions

```ts
// src/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
```

### Tailwind Utility Function (cn)

```ts
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes.
 *
 * @param inputs - Class names to combine
 * @returns Merged class string
 *
 * @example
 * cn('bg-red-500', 'text-white', { 'hover:bg-red-600': isHovered })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Schema Templates

### Prisma Schema with Relations

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

// Models
model User {
  id          String    @id @default(uuid())
  email       String    @unique
  name        String
  passwordHash String
  role        UserRole  @default(USER)
  posts       Post[]
  orders      Order[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("users")
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
  @@map("posts")
}

model Order {
  id          String       @id @default(uuid())
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  status      OrderStatus  @default(PENDING)
  total       Decimal      @db.Decimal(10, 2)
  items       OrderItem[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([userId])
  @@map("orders")
}

model OrderItem {
  id        String   @id @default(uuid())
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId   String
  productId String
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())

  @@index([orderId])
  @@map("order_items")
}
```

### Zod Validation Schema

```ts
// src/schemas/user.schema.ts
import { z } from "zod";

// Base schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Input schemas
export const CreateUserSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional(),
});

// Query schemas
export const UserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Params schemas
export const UserParamsSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

// Types
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
```

---

## Monorepo Templates

### Root Package.json

```json
{
  "name": "@repo/monorepo",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write .",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  },
  "workspaces": ["apps/*", "packages/*"]
}
```

### Turbo.json Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/tsconfig.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "cache": true,
      "inputs": ["src/**", "*.ts", "*.tsx"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Shared TypeScript Configuration

```json
// packages/config/typescript/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "sourceMap": true,
    "incremental": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "types": ["node"]
  },
  "exclude": ["node_modules", "dist", "build", "coverage"]
}
```

### Shared Package Template

```json
// packages/shared/package.json
{
  "name": "@repo/shared",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## Template Usage Guidelines

### When to Use Each Template

| Template              | Use When                            |
| --------------------- | ----------------------------------- |
| Express Route Handler | Creating a new API endpoint         |
| Service Module        | Implementing business logic         |
| Repository Module     | Abstracting data access             |
| Validation Middleware | Adding request validation to routes |
| Error Handler         | Setting up global error handling    |
| App Entry Point       | Starting a new Express application  |
| Configuration Module  | Managing environment configuration  |
| React Component       | Creating a new UI component         |
| Custom Hook           | Extracting reusable logic           |
| Data Fetching Hook    | Integrating with React Query        |
| API Client            | Setting up API communication        |
| Type Definitions      | Defining domain types               |
| Prisma Schema         | Defining database models            |
| Zod Schema            | Defining validation rules           |
| Monorepo Config       | Setting up monorepo structure       |

### Customization Guidelines

1. **Rename consistently** – Replace `User` with your domain entity name.
2. **Update imports** – Adjust import paths to match your project structure.
3. **Add business logic** – Replace placeholder logic with actual business rules.
4. **Adjust validation** – Modify schemas to match your validation requirements.
5. **Configure environment** – Update configuration with your environment variables.
6. **Add tests** – Write tests for the new code using the testing templates.

---

## Related Skills

- `references/checklists` – for ensuring completeness.
- `references/patterns` – for understanding patterns used in templates.
- `backend/express` – for Express-specific implementation.
- `frontend/react` – for React component implementation.
- `database/prisma` – for Prisma schema and queries.
- `quality/testing` – for testing templates.
- `quality/code-review` – for reviewing template usage.

---

## Official References

- [React Patterns – Templates](https://react.dev/learn/thinking-in-react)
- [Express Application Generator](https://expressjs.com/en/starter/generator.html)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Zod Schema Reference](https://zod.dev/)
- [Turborepo Repository Structure](https://turbo.build/repo/docs/core-concepts/repository-structure)
- [TypeScript Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [Jest Testing Templates](https://jestjs.io/docs/getting-started)
