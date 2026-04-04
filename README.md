# Finance Dashboard Backend

A robust, secure, and maintainable backend for a finance dashboard system. This API provides user and role management, financial records CRUD operations, and aggregated dashboard analytics, enforcing role-based access control (RBAC), input validation, and proper error handling.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (RBAC). Admin and regular user roles supported.
- **Financial Records Management**: Full CRUD operations for managing financial records (income, expenses, etc.).
- **Dashboard Analytics**: Aggregated data and metrics for the frontend dashboard.
- **Security**: Built-in security features including HTTP headers protection (`helmet`), rate limiting, and CORS.
- **Robust Validation**: Type-safe input validation using Zod.
- **ORM & Database**: Prisma ORM with PostgreSQL for robust data management and type-safe query building.
- **Testing**: Comprehensive automated testing using Jest and Supertest.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Testing**: Jest & Supertest

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database server running locally or remotely.

## Getting Started

### 1. Installation

Install the project dependencies:

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and configure the necessary environment variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Replace with your PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@localhost:5432/finance_dashboard?schema=public"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

### 3. Database Setup

Generate the Prisma client, run migrations, and optionally seed the database:

```bash
# Generate Prisma Client
npm run db:generate

# Apply migrations to your development database
npm run db:migrate

# Seed the database with initial/dummy data
npm run db:seed
```

### 4. Running the Application

To start the development server with hot-reloading:

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default is `3000`).

To build and run the production version:

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev`: Starts the development server using `tsx watch`.
- `npm run build`: Compiles the TypeScript code to JavaScript in the `dist` directory.
- `npm start`: Runs the compiled production server from `dist/server.js`.
- `npm run db:generate`: Generates the Prisma client based on your schema.
- `npm run db:migrate`: Runs Prisma database migrations.
- `npm run db:seed`: Executes the database seed script to populate initial data.
- `npm run db:reset`: Resets the database and reapplies all migrations (use with caution).
- `npm test`: Runs the Jest test suite.
- `npm run test:watch`: Runs Jest in watch mode for development.

## Project Structure

A brief overview of the project's structure:

- `src/`
  - `config/`: Application configuration files.
  - `modules/`: Feature-based modules (e.g., dashboard, users, records) containing controllers, services, routers, and schemas.
  - `middlewares/`: Custom Express middlewares (authentication, error handling, validation).
  - `utils/`: Reusable helper functions and utilities.
  - `server.ts`: Application entry point and server setup.
- `prisma/`: Prisma schema file (`schema.prisma`), migrations directory, and the database seed script.
- `dist/`: Compiled JavaScript output (generated after running the build script).
