# 🏦 Finance Dashboard Backend API

A robust, role-based financial data management backend built with **Node.js**, **TypeScript**, **Express**, **Prisma ORM**, and **PostgreSQL**.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Roles & Permissions](#-roles--permissions)
- [Design Decisions & Assumptions](#-design-decisions--assumptions)
- [Testing](#-testing)
- [Project Structure](#-project-structure)

---

## ✨ Features

- **JWT Authentication** — Register, login, and secure all endpoints with token-based auth
- **Role-Based Access Control (RBAC)** — Three-tier role system (Viewer, Analyst, Admin) with hierarchical permissions
- **Financial Records CRUD** — Full create/read/update/delete with soft-delete support
- **Advanced Filtering & Search** — Filter records by type, category, date range, amount range, and keyword search
- **Dashboard Analytics** — Summary totals, category breakdown, monthly/weekly trends, and recent activity
- **Pagination** — All list endpoints support cursor-free pagination with metadata
- **Input Validation** — Zod-powered request validation with descriptive errors
- **Rate Limiting** — In-memory per-IP rate limiter with stricter limits on auth endpoints
- **Structured Error Handling** — Consistent error responses with proper HTTP status codes
- **Graceful Shutdown** — Proper cleanup of database connections on SIGINT/SIGTERM

---

## 🛠 Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Node.js + TypeScript                |
| Framework     | Express.js                          |
| Database      | PostgreSQL                          |
| ORM           | Prisma v7 (with driver adapters)    |
| Auth          | JWT (jsonwebtoken) + bcryptjs       |
| Validation    | Zod                                 |
| Testing       | Jest + Supertest                    |
| Security      | Helmet, CORS, Rate Limiting         |

---

## 🏗 Architecture

The project follows a **modular service-oriented architecture** with clear separation of concerns:

```
src/
├── config/                # App config & database client
│   ├── index.ts           # Environment configuration
│   └── database.ts        # Prisma client singleton
├── middleware/             # Express middleware
│   ├── auth.ts            # JWT authentication
│   ├── rbac.ts            # Role-based access control
│   ├── validate.ts        # Zod request validation
│   ├── errorHandler.ts    # Global error handler
│   └── rateLimit.ts       # Rate limiting
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── auth.validation.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   ├── users/             # User management module
│   │   ├── users.validation.ts
│   │   ├── users.service.ts
│   │   ├── users.controller.ts
│   │   └── users.routes.ts
│   ├── records/           # Financial records module
│   │   ├── records.validation.ts
│   │   ├── records.service.ts
│   │   ├── records.controller.ts
│   │   └── records.routes.ts
│   └── dashboard/         # Analytics & summaries
│       ├── dashboard.service.ts
│       ├── dashboard.controller.ts
│       └── dashboard.routes.ts
├── utils/                 # Shared utilities
│   ├── response.ts        # Standardized API responses
│   └── errors.ts          # Custom error classes
├── app.ts                 # Express app setup
└── server.ts              # Server entry point
```

Each module follows the pattern: **Validation → Controller → Service → Database**

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally or a hosted instance
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone <repository-url>
cd Finance-dashboard
npm install
```

### 2. Configure Environment

Create a `.env` file (or edit the existing one):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_dashboard"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

> ⚠️ Make sure to create the `finance_dashboard` database in PostgreSQL before running migrations.

### 3. Create Database

```bash
psql -U postgres -c "CREATE DATABASE finance_dashboard;"
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Seed the Database (optional)

Seeds 3 test users and 23 financial records:

```bash
npm run db:seed
```

**Test accounts created:**
| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@zorvyn.com    | admin123    |
| Analyst | analyst@zorvyn.com  | analyst123  |
| Viewer  | viewer@zorvyn.com   | viewer123   |

### 7. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format

All responses follow a consistent shape:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": { "pagination": { ... } }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

### 🔐 Auth Endpoints

#### `POST /api/auth/register`
Register a new user (defaults to VIEWER role).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword",
  "name": "John Doe"
}
```

#### `POST /api/auth/login`
Authenticate and receive a JWT token.

**Body:**
```json
{
  "email": "admin@zorvyn.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "...", "role": "ADMIN" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

#### `GET /api/auth/profile` 🔒
Get the current authenticated user's profile.

---

### 👥 User Management (Admin Only)

All endpoints require `Authorization: Bearer <token>` with an ADMIN role.

#### `GET /api/users`
List users with pagination and filtering.

**Query params:** `page`, `limit`, `role`, `status`, `search`

#### `GET /api/users/:id`
Get a specific user's details.

#### `PATCH /api/users/:id`
Update a user's name, role, or status.

**Body:**
```json
{
  "role": "ANALYST",
  "status": "ACTIVE"
}
```

#### `DELETE /api/users/:id`
Soft-delete a user (sets `deleted=true`, `status=INACTIVE`).

---

### 💰 Financial Records

#### `GET /api/records` 🔒 (Viewer+)
List records with filtering, sorting, and pagination.

**Query params:**
| Param       | Description                      | Example            |
|-------------|----------------------------------|--------------------|
| `page`      | Page number (default: 1)         | `1`                |
| `limit`     | Items per page (default: 20)     | `10`               |
| `type`      | INCOME or EXPENSE                | `INCOME`           |
| `category`  | Category name (partial match)    | `Salary`           |
| `startDate` | Start date filter                | `2026-01-01`       |
| `endDate`   | End date filter                  | `2026-03-31`       |
| `minAmount` | Minimum amount                   | `5000`             |
| `maxAmount` | Maximum amount                   | `50000`            |
| `search`    | Search description/category      | `rent`             |
| `sortBy`    | Sort field                       | `date`/`amount`    |
| `sortOrder` | Sort direction                   | `asc`/`desc`       |

#### `GET /api/records/:id` 🔒 (Viewer+)
Get a single record.

#### `POST /api/records` 🔒 (Admin Only)
Create a new financial record.

**Body:**
```json
{
  "amount": 50000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2026-04-15",
  "description": "April salary"
}
```

#### `PATCH /api/records/:id` 🔒 (Admin Only)
Update a record (partial update supported).

#### `DELETE /api/records/:id` 🔒 (Admin Only)
Soft-delete a record.

---

### 📊 Dashboard Analytics

#### `GET /api/dashboard/summary` 🔒 (Viewer+)
Overall financial summary.

**Response:**
```json
{
  "totalIncome": 308000,
  "totalExpenses": 156500,
  "netBalance": 151500,
  "totalRecords": 23,
  "incomeCount": 7,
  "expenseCount": 16,
  "savingsRate": 49.19
}
```

#### `GET /api/dashboard/category-breakdown` 🔒 (Viewer+)
Totals grouped by category with income/expense/net for each.

#### `GET /api/dashboard/recent-activity?limit=10` 🔒 (Viewer+)
Most recent transactions.

#### `GET /api/dashboard/trends/monthly?months=12` 🔒 (Analyst+)
Monthly income/expense/net trends.

#### `GET /api/dashboard/trends/weekly?weeks=12` 🔒 (Analyst+)
Weekly income/expense/net trends.

---

### ❤️ Health Check

#### `GET /api/health`
Public endpoint — no auth required.

---

## 🛡 Roles & Permissions

| Action                         | Viewer | Analyst | Admin |
|--------------------------------|--------|---------|-------|
| View records                   | ✅     | ✅      | ✅    |
| Filter/search records          | ✅     | ✅      | ✅    |
| View dashboard summary         | ✅     | ✅      | ✅    |
| View category breakdown        | ✅     | ✅      | ✅    |
| View recent activity           | ✅     | ✅      | ✅    |
| Access monthly/weekly trends   | ❌     | ✅      | ✅    |
| Create financial records       | ❌     | ❌      | ✅    |
| Update financial records       | ❌     | ❌      | ✅    |
| Delete financial records       | ❌     | ❌      | ✅    |
| Manage users (CRUD)            | ❌     | ❌      | ✅    |
| Change user roles              | ❌     | ❌      | ✅    |

**Implementation:** RBAC is enforced via middleware that:
1. Re-fetches the user from the database on each request (prevents stale JWT role issues)
2. Checks the user's account status (inactive users are blocked)
3. Supports both exact-role matching and hierarchical minimum-role checks

---

## 🤔 Design Decisions & Assumptions

### Decisions
1. **Modular architecture** — Each domain (auth, users, records, dashboard) is a self-contained module with its own validation, service, controller, and routes.
2. **Soft deletes** — Records and users are soft-deleted (flagged, not removed) to maintain data integrity and allow recovery.
3. **Service layer pattern** — Business logic lives in services, controllers handle HTTP concerns only. This makes the logic testable and reusable.
4. **Re-verify on every request** — RBAC middleware checks the database for current role/status rather than trusting the JWT alone, preventing stale permission issues.
5. **Zod for validation** — Provides runtime type safety and descriptive error messages at the API boundary.
6. **In-memory rate limiting** — Suitable for single-instance deployments. For multi-instance, swap with Redis-backed limiter.
7. **Custom error classes** — `AppError` with factory methods ensures consistent error handling throughout the app.

### Assumptions
1. New users register with the **VIEWER** role by default. Only admins can promote users.
2. Admins **cannot** change their own role, deactivate themselves, or delete their own account (safety guards).
3. Date fields accept both ISO 8601 datetime strings and `YYYY-MM-DD` format.
4. The `category` field is free-text (not enumerated) to allow flexibility.
5. Dashboard analytics always **exclude soft-deleted records**.
6. Authentication uses simple JWT without refresh tokens (suitable for this scope).

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests cover:
- Health check endpoint
- 404 route handling
- Input validation (registration, login)
- Authentication enforcement on protected routes
- Access control on user and dashboard endpoints

---

## 📁 Project Structure

```
Finance-dashboard/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeder
├── prisma.config.ts            # Prisma v7 configuration
├── src/
│   ├── config/                 # Configuration & DB client
│   ├── generated/prisma/       # Prisma generated client (auto)
│   ├── middleware/              # Auth, RBAC, validation, errors, rate limit
│   ├── modules/                # Feature modules (auth, users, records, dashboard)
│   ├── utils/                  # Response helpers, error classes
│   ├── app.ts                  # Express app
│   └── server.ts               # Entry point
├── tests/                      # Test suite
├── .env                        # Environment variables
├── .gitignore
├── jest.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 📄 License

ISC
