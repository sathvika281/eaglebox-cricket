# Eagle Box Cricket — Backend API

**Version:** 1.0.0 | **Phase:** 1 — Day 19 Deliverable

A production-ready REST API for managing a box cricket venue. Built with Node.js, Express.js, and PostgreSQL using MVC architecture.

---

## Features

- JWT Authentication with access + refresh token rotation
- Role-Based Access Control (admin / customer)
- Slot Management with overlap prevention and soft delete
- Booking Management with lifecycle event tracking
- Full Audit Logging on every write operation
- Joi validation on all endpoints
- Swagger API documentation
- Rate limiting, Helmet security headers, CORS

---

## Architecture

```
Client (React)
     ↓
Express API (Port 5001)
     ↓
Routes → Controllers → Services → Models
     ↓
PostgreSQL (Aiven Cloud)

Middleware Stack:
Helmet → CORS → Rate Limiter → JWT Auth → RBAC → Joi Validation → Audit Log → Controller
```

---

## Tech Stack

| Layer          | Technology              |
|----------------|-------------------------|
| Runtime        | Node.js                 |
| Framework      | Express.js              |
| Database       | PostgreSQL (Aiven)      |
| Authentication | JWT (access + refresh)  |
| Password Hash  | bcrypt (12 rounds)      |
| Validation     | Joi                     |
| Security       | Helmet, CORS, Rate Limit|
| Documentation  | Swagger / OpenAPI 3.0   |
| Architecture   | MVC                     |

---

## Folder Structure

```
api/
├── server.js
├── migrations/
│   └── 001_initial_schema.sql
├── src/
│   ├── config/
│   │   ├── database.js      PostgreSQL pool
│   │   ├── migrate.js       Run schema migrations
│   │   ├── seed.js          Seed admin + sample data
│   │   └── swagger.js       Swagger spec config
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── slot.controller.js
│   │   └── booking.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    JWT verification
│   │   ├── rbac.middleware.js    Role enforcement
│   │   ├── validate.middleware.js Joi validation
│   │   ├── audit.middleware.js   Write operation logging
│   │   └── errorHandler.js      Global error handler
│   ├── models/
│   │   ├── user.model.js
│   │   ├── slot.model.js
│   │   ├── booking.model.js
│   │   └── audit.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── health.routes.js
│   │   ├── auth.routes.js
│   │   ├── slot.routes.js
│   │   └── booking.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── slot.service.js
│   │   └── booking.service.js
│   └── utils/
│       ├── jwt.utils.js
│       ├── bcrypt.utils.js
│       ├── pagination.utils.js
│       └── response.utils.js
└── .env.example
```

---

## Installation

```bash
cd api
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable             | Description                        |
|----------------------|------------------------------------|
| PORT                 | Server port (default: 5001)        |
| DB_HOST              | PostgreSQL host (Aiven)            |
| DB_PORT              | PostgreSQL port                    |
| DB_USER              | Database user                      |
| DB_PASSWORD          | Database password                  |
| DB_NAME              | Database name (defaultdb)          |
| DB_SSL               | Enable SSL (true for Aiven)        |
| JWT_ACCESS_SECRET    | Secret for access tokens           |
| JWT_REFRESH_SECRET   | Secret for refresh tokens          |
| JWT_ACCESS_EXPIRES   | Access token TTL (default: 15m)    |
| JWT_REFRESH_EXPIRES  | Refresh token TTL (default: 7d)    |
| FRONTEND_URL         | Allowed CORS origin                |

---

## Database Setup

### 1. Create PostgreSQL on Aiven

1. Go to [console.aiven.io](https://console.aiven.io)
2. Create service → PostgreSQL → Free tier
3. Copy connection credentials to `.env`

### 2. Run Migration

Creates all 7 Phase 1 tables + indexes:

```bash
npm run migrate
```

### 3. Seed Admin User

```bash
npm run seed
```

Seed output:
```
Admin     → admin@eaglebox.com / Admin@2026
Customer  → sathvika@example.com / Customer@2026
Slots     → 48 slots (today + 7 days, 6 slots/day)
```

---

## Running the Server

**Development (auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server starts on `http://localhost:5001`

---

## Swagger Documentation

```
http://localhost:5001/api/docs
```

All endpoints are documented with request/response examples and JWT authentication.

---

## API Overview

### Health
| Method | Endpoint       | Auth | Description     |
|--------|----------------|------|-----------------|
| GET    | /api/v1/health | No   | Health check    |

### Authentication
| Method | Endpoint               | Auth     | Description           |
|--------|------------------------|----------|-----------------------|
| POST   | /api/v1/auth/register  | Public   | Register new account  |
| POST   | /api/v1/auth/login     | Public   | Login → JWT tokens    |
| POST   | /api/v1/auth/refresh   | Public   | Refresh access token  |
| POST   | /api/v1/auth/logout    | Bearer   | Revoke refresh token  |
| GET    | /api/v1/auth/me        | Bearer   | Get profile           |
| PATCH  | /api/v1/auth/me        | Bearer   | Update profile        |

### Slots
| Method | Endpoint           | Auth    | Role    | Description         |
|--------|--------------------|---------|---------|---------------------|
| GET    | /api/v1/slots      | Public  | Any     | List slots          |
| POST   | /api/v1/slots      | Bearer  | Admin   | Create slot         |
| PUT    | /api/v1/slots/:id  | Bearer  | Admin   | Update slot         |
| DELETE | /api/v1/slots/:id  | Bearer  | Admin   | Soft delete slot    |

### Bookings
| Method | Endpoint                       | Auth   | Role     | Description         |
|--------|--------------------------------|--------|----------|---------------------|
| POST   | /api/v1/bookings               | Bearer | Customer | Create booking      |
| GET    | /api/v1/bookings/mine          | Bearer | Customer | My bookings         |
| GET    | /api/v1/bookings               | Bearer | Admin    | All bookings        |
| PUT    | /api/v1/bookings/:id/status    | Bearer | Admin    | Update status       |

---

## Security Features

| Feature          | Implementation                          |
|------------------|-----------------------------------------|
| Authentication   | JWT access (15min) + refresh (7d)       |
| Password Hashing | bcrypt 12 rounds                        |
| Authorization    | RBAC — admin / customer roles           |
| Input Validation | Joi on every endpoint                   |
| Security Headers | Helmet.js                               |
| Rate Limiting    | 100 req / 15 min per IP                 |
| CORS             | Whitelist frontend origin               |
| Audit Logging    | Every write logged with user + IP       |
| SQL Injection    | Parameterized queries (pg library)      |
| Soft Delete      | No permanent data deletion              |

---

## Database Tables

| Table          | Purpose                        | Soft Delete |
|----------------|--------------------------------|-------------|
| users          | User accounts                  | Yes         |
| refresh_tokens | JWT token store                | —           |
| slots          | Cricket time slots             | Yes         |
| bookings       | Slot reservations              | Yes         |
| booking_events | Booking lifecycle tracking     | —           |
| audit_logs     | System audit trail             | —           |

---

## Test Credentials

| Role     | Email                   | Password       |
|----------|-------------------------|----------------|
| Admin    | admin@eaglebox.com      | Admin@2026     |
| Customer | sathvika@example.com    | Customer@2026  |

---

## Scripts

```bash
npm run dev      # Start development server
npm start        # Start production server
npm run migrate  # Run database migrations
npm run seed     # Seed admin user and sample slots
```
