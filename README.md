# Finance Dashboard Backend

A production-ready backend for a finance dashboard system built with Node.js, Express, PostgreSQL, and Prisma. Features role-based access control, JWT authentication, audit logging, soft deletes, and auto-generated Swagger documentation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL (Docker) |
| ORM | Prisma 7 |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Docs | Swagger UI (OpenAPI 3.0) |

---

## Project Structure

```text
finance-backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client with pg adapter
│   │   └── swagger.js         # Swagger/OpenAPI config
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── roleGuard.js       # Role-based access control
│   │   ├── auditLogger.js     # Mutation audit logging
│   │   └── errorHandler.js    # Centralized error handler
│   ├── modules/
│   │   ├── auth/              # Register, login, JWT
│   │   ├── users/             # User management
│   │   ├── records/           # Financial records CRUD
│   │   └── dashboard/         # Summary and analytics
│   ├── utils/
│   │   └── response.js        # Consistent response formatter
│   └── app.js                 # Express app entry point
├── prisma/
│   └── schema.prisma          # Database schema
├── docker-compose.yml         # PostgreSQL via Docker
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop

### 1. Clone the repository

```cmd
git clone <your-repo-url>
cd finance-backend
```

### 2. Install dependencies

```cmd
npm install
```

### 3. Set up environment variables

```cmd
copy .env.example .env
```

Update `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_db"
JWT_SECRET="your_super_secret_key_change_this"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:3000"
```

### 4. Start PostgreSQL with Docker

```cmd
docker-compose up -d
```

### 5. Run database migrations

```cmd
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the development server

```cmd
npm run dev
```

### 7. Open Swagger docs

```text
http://localhost:5000/api/docs
```

---

## API Overview

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register a new user |
| POST | /api/auth/login | Public | Login and get JWT token |
| GET | /api/auth/me | All roles | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/users | Admin | Get all users with pagination |
| GET | /api/users/:id | Admin | Get user by ID |
| PATCH | /api/users/:id | Admin | Update user details or role |
| PATCH | /api/users/:id/toggle-status | Admin | Activate or deactivate user |
| DELETE | /api/users/:id | Admin | Delete a user |

### Financial Records
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/records | Admin, Analyst | Create a financial record |
| GET | /api/records | All roles | Get records with filters and pagination |
| GET | /api/records/:id | All roles | Get a record by ID |
| PATCH | /api/records/:id | Admin, Analyst | Update a record |
| DELETE | /api/records/:id | Admin | Soft delete a record |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/dashboard/summary | All roles | Total income, expenses, net balance, recent activity |
| GET | /api/dashboard/categories | Admin, Analyst | Income and expense breakdown by category |
| GET | /api/dashboard/trends | Admin, Analyst | Monthly income and expense trends |
| GET | /api/dashboard/admin-stats | Admin | User stats and recent audit logs |

---

## Role System

| Permission | Viewer | Analyst | Admin |
|---|---|---|---|
| View own records | ✅ | ✅ | ✅ |
| View all records | ❌ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update own records | ❌ | ✅ | ✅ |
| Update any record | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| View category breakdown | ❌ | ✅ | ✅ |
| View monthly trends | ❌ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

---

## Key Design Decisions

### Soft Deletes
Financial records are never permanently deleted. A `deletedAt` timestamp is set instead. This mirrors real-world finance systems where data must remain traceable for compliance and auditing purposes.

### Audit Logging
Every create, update, and delete mutation is recorded in the `AuditLog` table with the actor, entity, entity ID, and a JSON diff of what changed. This gives admins full visibility into who changed what and when.

### Layered Architecture
Each module follows a strict three-layer pattern — routes handle HTTP, controllers handle request/response, and services contain all business logic. This separation makes the codebase easy to test and maintain.

### Role-Based Dashboard Views
Dashboard endpoints return different data depending on the caller's role. Viewers see only their own data. Analysts get full aggregations. Admins get everything plus user statistics and audit logs.

### Centralized Error Handling
All errors flow through a single Express error handler. Zod validation errors, Prisma errors, and custom application errors are all normalized into the same response shape, making frontend error handling predictable.

### Consistent Response Shape
Every API response follows the same structure:
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "error": "...", "details": [] }
```
This makes frontend integration straightforward — every component checks `success` first.

---

## Assumptions and Tradeoffs

- **Docker for PostgreSQL** — chosen to avoid local PostgreSQL setup complexity and keep the environment reproducible.
- **Prisma 7** — uses the new `prisma.config.ts` and `@prisma/adapter-pg` pattern instead of the legacy `url` field in `schema.prisma`.
- **No refresh tokens** — JWT tokens expire in 7 days. Refresh token rotation was omitted to keep the auth implementation clean and within scope.
- **Analysts can create and update their own records** — this felt like the most practical interpretation of an analyst role in a finance dashboard context.
- **Soft deletes on records only** — users are hard deleted since user data does not carry the same compliance requirements as financial records in this context.
- **In-memory grouping for trends** — monthly trend aggregation is done in JavaScript rather than SQL for readability and portability across databases.

---

## Available Scripts

```cmd
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio GUI
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/finance_db |
| JWT_SECRET | Secret key for signing JWT tokens | your_super_secret_key |
| JWT_EXPIRES_IN | JWT token expiry duration | 7d |
| PORT | Port the server runs on | 5000 |
| CLIENT_URL | Allowed CORS origin for frontend | http://localhost:3000 |