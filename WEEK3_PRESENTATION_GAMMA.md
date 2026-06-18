# Eagle Box Cricket — Week 3 Internship Review
## Full-Stack Slot Booking System | T. Sathwika | Jaya Vardhan | Sravani | Team Project — Backend Development Focus

---

# Slide 1 — Title

## Eagle Box Cricket
### Full-Stack Slot Booking System
**Week 3 Internship Review | June 2026**

- **Presenting:** T. Sathwika — Backend Developer
- **Team:** Jaya Vardhan (Frontend) · T. Sathwika (Backend) · Sravani (Tester / QA)
- **Stack:** Node.js · PostgreSQL · React 18
- **Team Deliverable:** Production-ready booking platform — backend + frontend

> **Speaker Note:** "Over the past three weeks, our team designed and built a complete slot booking system for Eagle Box Cricket. The project was split across three roles — I handled the backend: database design, the REST API, and JWT authentication. Jaya Vardhan built the React UI on the frontend, and Sravani handled testing and bug verification. Today I'll walk through the full architecture and my specific contributions."

📸 *Screenshot: App home screen on mobile with hero background — http://localhost:3000*

---

# Slide 2 — Project Scope

## What Was Built

**Core Modules (Completed):**
- User registration & login with JWT authentication
- Slot browsing — real-time availability by date
- Slot booking with player count selection
- My Bookings — paginated history with status filters
- Profile management — view & edit personal details
- Full booking lifecycle: pending → confirmed → completed

**Deliberately Excluded (Out of Phase 1):**
- Admin dashboard (slot management, booking approvals)
- Tournament registration module
- Leaderboards
- Payment gateway (Razorpay integrated in backend, not wired in UI)

> **Speaker Note:** "Scope control was a deliberate team decision. We identified that admin tools and tournament features were not required for a Day 19 MVP and removed them cleanly — no dead routes, no orphaned components. Phase 1 is a complete, testable product for customers."

📸 *Screenshot: App routing diagram or the 8-page app navigation visible in browser*

---

# Slide 3 — Team Roles & Contributions

## Who Built What

### Frontend Developer — Jaya Vardhan
- React UI development across all 8 pages
- Client-side routing and navigation (React Router v6)
- Responsive dark-premium design system (JetBrains Mono + Hanken Grotesk)
- Authentication screens — Login and Register pages
- Dashboard, Booking, My Bookings, and Profile screens
- Axios API integration layer and JWT token attachment

### Backend Developer (Sathwika)
- PostgreSQL schema design — 4 tables, UUID PKs, soft deletes, constraints
- Express.js REST API — 15 endpoints across auth, slots, and bookings
- JWT dual-token authentication — access (15 min) + refresh (7 days)
- Refresh token rotation with hash storage and explicit revocation
- RBAC middleware — `authorize('admin')` / `authorize('customer')`
- Swagger documentation at `/api/v1/docs`
- Booking and slot management APIs with full lifecycle support
- Security middleware — helmet, rate limiting, Joi validation

### Tester / QA Engineer — Sravani
- Test case preparation covering all user flows
- Postman API testing — all 15 endpoints verified
- Authentication testing — register, login, refresh, logout flows
- Booking workflow testing — slot selection through confirmation
- Integration testing — frontend-to-backend request/response validation
- Bug reporting and verification (e.g. caught `num_players` missing field issue)

> **Speaker Note:** "We split the project cleanly across three roles. I'm presenting from the backend perspective — I'll go deep on the API design, database decisions, and auth implementation. Jaya Vardhan built the React UI on top of the API contracts I defined, and Sravani tested every flow end-to-end using Postman before we integrated. That division meant we could work in parallel and integration was smooth because the API contracts were clear from the start."

📸 *Screenshot: Swagger UI showing all 15 endpoints — represents the backend contract the team built against*

---

# Slide 4 — System Architecture

## Architecture Overview

```
┌─────────────────────┐       ┌──────────────────────────┐
│   React 18 Frontend │       │   Node.js / Express API   │
│   Port :3000        │──────▶│   Port :5001              │
│   CRA + React Router│       │   REST · JWT · Joi        │
└─────────────────────┘       └────────────┬─────────────┘
                                            │
                               ┌────────────▼─────────────┐
                               │  PostgreSQL (Aiven Cloud) │
                               │  SSL · Connection Pool    │
                               │  4 Tables · UUID PKs      │
                               └──────────────────────────┘
```

**Key Architectural Decisions:**
- **Separation of concerns:** Frontend and API are fully independent processes
- **Stateless API:** No server-side sessions — all auth via JWT Bearer tokens
- **Cloud DB:** Aiven-hosted PostgreSQL (SSL enforced, pool max 10 connections)
- **CRA Proxy:** Dev-time `/api/v1/*` proxied to `:5001` — zero CORS config needed in dev

> **Speaker Note:** "The frontend and backend are completely decoupled. The React app talks to the API only through Axios with a Bearer token. In production, they'd sit behind a reverse proxy like Nginx. The database is hosted on Aiven Cloud, so it's already in a production-grade environment — no local PostgreSQL setup was needed."

📸 *Screenshot: Terminal showing both servers running (port 3000 + 5001)*

---

# Slide 5 — Database Design

## PostgreSQL Schema — 4 Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | gen_random_uuid() |
| name, email, phone | VARCHAR | email + phone UNIQUE |
| password_hash | VARCHAR | bcryptjs, 10 rounds |
| role | VARCHAR | CHECK IN ('admin','customer') |
| is_deleted | BOOLEAN | soft delete |

### `refresh_tokens`
| Column | Type | Notes |
|--------|------|-------|
| token_hash | VARCHAR | stored as hash, not plaintext |
| expires_at | TIMESTAMPTZ | 7-day TTL |
| is_revoked | BOOLEAN | explicit logout support |

### `slots`
| Column | Type | Notes |
|--------|------|-------|
| slot_date + start_time | UNIQUE | prevents double-creation |
| status | VARCHAR | CHECK IN ('available','booked','blocked') |
| price | NUMERIC(10,2) | per-slot pricing |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| booking_ref | VARCHAR(20) | e.g. EBCI39HVJ5SK — custom generator |
| num_players | INT | CHECK BETWEEN 1 AND 22 |
| status | VARCHAR | pending → confirmed → completed |
| payment_status | VARCHAR | unpaid / paid / refunded |
| total_amount | NUMERIC(10,2) | calculated at creation |

**Design Choices:**
- UUIDs as primary keys (no sequential ID guessing)
- Soft deletes on users, slots, bookings (`is_deleted` flag)
- DB-level CHECK constraints as last line of defence
- Parallel COUNT + SELECT queries for pagination (Promise.all)

> **Speaker Note:** "The backend uses UUIDs as primary keys throughout — this prevents sequential ID enumeration attacks. Soft deletes mean booking history is never lost, even if a user deletes their account. The slots table has a composite UNIQUE constraint on date + start_time, so it's impossible to create two slots at the same time even with concurrent requests."

📸 *Screenshot: Schema diagram or pgAdmin table view*

---

# Slide 6 — Backend API Design

## REST API — Node.js + Express

**Base URL:** `http://localhost:5001/api/v1`
**Documentation:** Swagger UI at `/api/v1/docs`

### Endpoints Built (15 total)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /auth/register | Public | Create customer account |
| POST | /auth/login | Public | Returns accessToken + refreshToken |
| POST | /auth/refresh | Public | Rotate access token |
| POST | /auth/logout | Bearer | Revoke refresh token |
| GET | /auth/me | Bearer | Get logged-in user profile |
| PATCH | /auth/me | Bearer | Update name / phone |
| GET | /slots | Public | List slots with date/status filter |
| POST | /slots | Admin | Create slot |
| PUT | /slots/:id | Admin | Update slot |
| DELETE | /slots/:id | Admin | Soft delete slot |
| POST | /bookings | Customer | Create booking |
| GET | /bookings/mine | Customer | My bookings (paginated) |
| GET | /bookings | Admin | All bookings (admin) |
| PUT | /bookings/:id/status | Admin | Confirm / cancel / complete |
| GET | /health | Public | Server health check |

### Middleware Stack (every request)
```
Request → helmet() → cors() → express.json() → rateLimit()
       → authenticate() → authorize() → validate(Joi) → controller
```

**Validation Example — POST /bookings:**
```js
Joi.object({
  slot_id:     Joi.string().uuid().required(),
  num_players: Joi.number().integer().min(1).max(22).required(),
  notes:       Joi.string().max(500).optional()
})
```

> **Speaker Note:** "Every request passes through helmet for security headers, rate limiting at 100 requests per 15 minutes, then Joi schema validation before the controller even runs. The backend uses a separate RBAC middleware so the authorize('admin') or authorize('customer') call is a one-liner on any route. Swagger documentation is live — reviewers can test the API directly in the browser."

📸 *Screenshot: Swagger UI at http://localhost:5001/api/v1/docs showing the endpoints*

---

# Slide 7 — Authentication Flow

## JWT Authentication — Dual Token Strategy

```
REGISTRATION                        LOGIN
User fills form          →   POST /auth/register
Joi validates input      →   Hash password (bcrypt, 10 rounds)
Store user in DB         →   Return user object

                              POST /auth/login
                         →   Verify password (bcrypt.compare)
                         →   Issue accessToken  (JWT, 15 min)
                         →   Issue refreshToken (JWT, 7 days)
                         →   Store refreshToken HASH in DB
                         →   Return both tokens to client
```

```
AUTHENTICATED REQUEST
localStorage → ebc_access_token
Axios interceptor → Authorization: Bearer <token>
API → verifyAccess(token) → req.user = payload
```

```
TOKEN REFRESH (auto, transparent to user)
API returns 401   →  Axios response interceptor fires
Queue all pending requests
POST /auth/refresh with refreshToken
New accessToken issued  →  Retry all queued requests
If refresh also 401  →  dispatch('auth:logout')  →  redirect /login
```

**Security Measures:**
- Passwords: bcryptjs, 10 salt rounds
- Refresh tokens: stored as SHA-256 hash (never plaintext)
- Access token: 15-minute TTL (minimises stolen-token window)
- Explicit logout revokes refresh token in DB
- RBAC: `authorize('admin')` / `authorize('customer')` middleware

> **Speaker Note:** "The dual-token pattern is industry standard. The short-lived access token means even if it's intercepted, it expires in 15 minutes. The refresh token is stored as a hash in the database — so if the DB is compromised, tokens can't be replayed. The Axios interceptor handles refresh transparently — the user never sees a re-login unless the refresh token itself is expired or revoked."

📸 *Screenshot: Login page with network tab open showing the two tokens in the response*

---

# Slide 8 — Frontend Architecture

## React 18 — 8 Pages, Zero External UI Libraries

**Tech Stack:**
- React 18 + React Router v6 (BrowserRouter)
- Axios with JWT interceptors (auto-attach + auto-refresh)
- React Context API (AuthContext — single source of truth)
- Inline JS style objects (existing project convention)
- Fonts: JetBrains Mono (labels/stats), Hanken Grotesk (body)

**Folder Structure:**
```
src/
├── api/          axios.js · auth.api.js · slots.api.js · bookings.api.js
├── context/      AuthContext.jsx
├── components/
│   └── layout/   TopBar · BottomNav · ProtectedRoute
├── pages/        Home · Login · Register · Dashboard · Booking
│                 MyBookings · Profile · NotFound
└── utils/        formatters.js
```

**Route Table:**
| Route | Page | Guard |
|-------|------|-------|
| / | Home | Public |
| /login | Login | Public |
| /register | Register | Public |
| /dashboard | Dashboard | ProtectedRoute |
| /booking | Booking | ProtectedRoute |
| /my-bookings | MyBookings | ProtectedRoute |
| /profile | Profile | ProtectedRoute |
| * | NotFound | — |

**ProtectedRoute logic:**
- While `loading === true` → spinner (prevents flash-of-login)
- `isAuthenticated === false` → `<Navigate to="/login" replace />`
- Authenticated → renders children

> **Speaker Note:** "The frontend developer opted not to use Redux or Zustand — React Context is sufficient for Phase 1 since the user object only changes on login, logout, or profile update. The ProtectedRoute component checks the loading state before redirecting, which prevents users from being kicked to the login page during the initial token verification on page load."

📸 *Screenshot: Dashboard page showing welcome + stats + booking cards*

---

# Slide 9 — Booking Workflow

## 3-Step Booking Flow

```
STEP 1 — SELECT                STEP 2 — OVERVIEW          STEP 3 — CONFIRMED
────────────────────           ────────────────────        ───────────────────
Date strip (next 7 days)  →   Slot details card      →   Booking ref (EBCXXXXX)
Slot grid (2 columns)         Date / Time / Venue         Date, Time, Players
Morning / Prime Time          Player count stepper         Amount (₹)
  sessions grouped            (1–22, default: 6)           Status: PENDING
HOT badge (price > ₹1000)    Total amount                 "View My Bookings"
                              "CONFIRM BOOKING" CTA        "Book Another Slot"
                              Shield: Safe & Secure
```

**API Call — POST /api/v1/bookings:**
```json
{
  "slot_id": "6c978a10-713b-452b-b72e-261818acef3f",
  "num_players": 6
}
```
**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "booking_ref": "EBCI39HVJ5SK",
    "status": "pending",
    "total_amount": "600.00",
    "num_players": 6
  }
}
```

**Booking Status Lifecycle (backend):**
```
pending → confirmed (admin) → completed (admin)
        → cancelled (admin or future: customer self-cancel)
```

> **Speaker Note:** "The booking flow is deliberately 3 steps — select, review, confirm — matching the Stitch UI designs. The player count stepper validates 1–22 at both the frontend and the backend Joi schema. The booking reference is generated using a custom function combining a timestamp base-36 and random suffix, giving a human-readable code like EBCI39HVJ5SK."

📸 *Screenshot: Booking page Step 1 (slot grid) and Step 3 (confirmation screen side by side)*

---

# Slide 10 — Key Technical Implementations

## Engineering Highlights

### 1. Axios Interceptor with Request Queuing
When the access token expires mid-session, concurrent API calls all fail with 401. The Axios interceptor (built by the frontend developer on top of the backend auth contract):
- Sets `isRefreshing = true` to prevent multiple simultaneous refresh calls
- Queues all failed requests in a `failedQueue` array
- After one successful token refresh, replays ALL queued requests
- On second 401, dispatches `auth:logout` event → AuthContext clears state → redirect

### 2. Pagination with Parallel COUNT
```js
const [{ rows: data }, { rows: countRows }] = await Promise.all([
  query(`SELECT ... LIMIT $n OFFSET $m`, params),
  query(`SELECT COUNT(*) FROM ...`, params),
]);
```
Single round-trip for both page data and total count — standard production pattern.

### 3. Joi Validation Middleware
```js
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) return validationError(res, error.details);
  next();
};
```
Reusable across all routes. Returns all validation errors at once (not just the first).

### 4. Soft Deletes + Booking Reference Generator
- No hard deletes anywhere in the system
- Booking refs: `'EBC' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random()...`
- Unique, human-readable, collision-resistant

### 5. Frontend Date Formatter (ISO Datetime Safety)
The API returns `slot_date` as a full ISO timestamp (`2026-06-16T18:30:00.000Z`). Naive parsing with `new Date(str + 'T00:00:00')` would corrupt it. Fix:
```js
const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
```

> **Speaker Note:** "The request queuing pattern in the Axios interceptor was the most complex piece. Without it, if 3 API calls fire simultaneously after token expiry, you'd get 3 concurrent refresh requests — race condition. The queue pattern solves this with just a flag and an array. This is the same pattern used in production apps like Spotify and Airbnb's frontend code."

📸 *Screenshot: Browser DevTools Network tab showing token refresh flow*

---

# Slide 11 — Challenges & How They Were Solved

## Real Problems, Real Solutions

| Challenge | What Happened | How I Solved It |
|-----------|---------------|-----------------|
| **CRA dev server crash** | `allowedHosts[0] should be a non-empty string` on startup | Created `frontend/.env` with `HOST=localhost` — CRA 5 + webpack-dev-server v4 requires explicit host |
| **num_players validation** | POST /bookings returned 422 "num_players is required" — only slot_id was being sent | Added player count stepper to UI Step 2, updated `createBooking(slot_id, num_players)` API call |
| **ISO date corruption** | `slot_date` from API is `"2026-06-16T18:30:00.000Z"` — appending `T00:00:00` produced invalid date string | Added `.includes('T')` check in all formatters to branch between plain date and ISO datetime |
| **Register double-token** | Manual `localStorage.setItem()` after register + `login()` call = duplicate token writes | Removed manual token writes, call `login()` from AuthContext which handles everything |
| **Concurrent 401 race condition** | Multiple expired-token requests fired simultaneously → multiple refresh calls | Implemented `isRefreshing` flag + `failedQueue` pattern in Axios interceptor |
| **Scope creep risk** | Original codebase had AdminDashboard, TournamentRegistration | Deleted both files before starting, enforced 8-route-only constraint throughout |

> **Speaker Note:** "Every one of these was a real bug encountered during development — not hypothetical. The num_players bug was the most visible: the UI appeared to work but every booking request silently failed with a 422. The issue was identified during integration testing and verification of the booking workflow."

---

# Slide 12 — Live Demo Flow

## What to Demo (in order)

1. **Home** → `localhost:3000` — hero image, live slots today, features section
2. **Register** → Create a new account — form validation, success redirect to dashboard
3. **Login** → Sign in — error state with wrong password, then correct credentials
4. **Dashboard** → Booking stats (total/confirmed/pending), recent bookings card
5. **Book a Slot** → Date strip → select slot → player stepper → confirm → booking ref
6. **My Bookings** → Filter by PENDING → see the booking just created
7. **Profile** → Edit name → save → avatar initials update → Sign out → redirect to login
8. **404** → Navigate to `localhost:3000/anything` → "OUT OF BOUNDS" page

**Demo Credentials:**
- Email: `smoketest@eagle.com`
- Password: `Test1234!`
- (Has 1 existing booking — good for showing My Bookings page)

> **Speaker Note:** "We'll demo the happy path first — register, book a slot, see it in my bookings. Then show the error states — wrong password on login, and the 404 page. The whole demo should take about 3 minutes."

---

# Slide 13 — Current Status

## What's Complete vs. What's Next

### Phase 1 — Completed ✅
- [x] PostgreSQL schema — 4 tables, migrations, seed data
- [x] REST API — 15 endpoints, Joi validation, Swagger docs
- [x] JWT auth — dual token, refresh rotation, RBAC
- [x] React frontend — 8 pages, all connected to real API
- [x] Booking flow — 3-step: select → overview → confirmation
- [x] My Bookings — paginated, filter by status
- [x] Profile — view and edit via PATCH /auth/me
- [x] Error handling — validation errors, auth errors, 404
- [x] Premium dark UI — JetBrains Mono + Hanken Grotesk + neon lime `#BFFF00`

### Phase 2 — Future Scope 🔜
- [ ] Admin dashboard — slot creation, booking management
- [ ] Payment integration — Razorpay SDK already installed in API
- [ ] Push notifications — booking status change alerts
- [ ] Customer self-cancel — currently admin-only
- [ ] Email confirmation — Nodemailer already installed in API
- [ ] Tournament registration module

> **Speaker Note:** "Razorpay and Nodemailer are already installed in the API — the package is there, it just isn't wired to a route yet. So payment integration is a matter of adding the controller and route, not starting from scratch."

📸 *Screenshot: package.json showing razorpay and nodemailer as installed dependencies*

---

# Slide 14 — Viva Questions & Answers

## Likely Technical Questions

**Q1: Why JWT over sessions?**
JWT is stateless — the server doesn't need to store session data. This makes horizontal scaling trivial (any server can verify a token without shared session storage). The trade-off is token revocation is harder, which is why the backend uses short-lived access tokens (15min) plus a DB-backed refresh token that can be explicitly revoked on logout.

**Q2: Why two tokens — access and refresh?**
If we used one long-lived token, a stolen token would be valid for weeks. The 15-minute access token limits the damage window. The 7-day refresh token gives UX continuity (user stays logged in). The refresh token is stored as a hash — so a DB breach doesn't give an attacker usable tokens.

**Q3: What does the Axios interceptor actually do?**
It's a response interceptor. When any API call returns 401, it intercepts the error before the component sees it. It pauses new requests, calls POST /auth/refresh with the stored refresh token, gets a new access token, then retries the original failed request. If refresh also fails, it clears auth state and redirects to login.

**Q4: Why PostgreSQL, not MongoDB?**
Bookings have clear relational structure: a booking belongs to a user AND a slot. A JOIN query to get booking + slot + user details in one query is natural in SQL. MongoDB would require multiple queries or complex $lookup aggregations for the same result. The relational constraints (FK from bookings to users and slots) also enforce data integrity at the DB level.

**Q5: What is Joi and why use it?**
Joi is a JavaScript schema validation library. Instead of writing `if (!req.body.email) return 400`, I declare the expected shape of the request once as a schema, and Joi validates everything automatically — type checking, format checking, required fields, value ranges. The `validate` middleware wraps it so any route can use it in one line: `validate(createSchema)`.

**Q6: What does soft delete mean?**
Instead of `DELETE FROM users WHERE id = $1`, I run `UPDATE users SET is_deleted = TRUE WHERE id = $1`. The row stays in the database — all queries filter by `is_deleted = FALSE`. This preserves booking history and audit trails, and makes accidental-deletion recovery trivial.

**Q7: Why UUIDs instead of auto-increment IDs?**
Sequential IDs are predictable — `GET /bookings/5` reveals that bookings 1–4 exist, enabling scraping or enumeration. UUIDs are globally unique and non-guessable. They also work safely in distributed systems where multiple nodes might generate IDs simultaneously.

**Q8: How does RBAC work in your API?**
There's a separate `authorize.js` middleware that reads `req.user.role` (set by the `authenticate` middleware after token verification). Admin-only routes have `authorize('admin')` before the controller. Customer routes use `authorize('customer')`. If the role doesn't match, the middleware returns 403 Forbidden before the controller runs.

**Q9: What is the booking reference format?**
`'EBC' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2,5)`. The timestamp part gives time-ordered uniqueness; the random suffix prevents collisions if two bookings are created at the same millisecond. Example: `EBCI39HVJ5SK`.

**Q10: Did you write tests?**
PowerShell smoke tests were run to validate the full API journey — register, login, get slots, create booking, get my bookings, update profile, logout. Each returned the expected response shape. Unit tests and integration tests are in the Phase 2 scope. The smoke tests helped surface issues like the `num_players` missing field during validation of the booking workflow.

> **Speaker Note:** "If asked about anything not listed here — be honest. Say 'that's something I'd look at for Phase 2' or 'I know where to find that in the code.' Honesty about scope is more impressive than bluffing."

---

# Slide 15 — Summary

## Week 3 Deliverables

**Team Deliverables — what the team shipped together:**
- Production-ready slot booking platform (backend + frontend)
- Complete booking lifecycle: browse → select → review → confirm → history
- Secure dual-token authentication with auto-refresh and request queuing
- Premium dark UI live on localhost — mobile-first, real API data throughout

**Backend Contributions (Sathwika):**
- PostgreSQL schema — 4 tables, UUID PKs, soft deletes, migrations, seed data
- 15-endpoint REST API — Joi validation, RBAC middleware, Swagger documentation
- JWT dual-token auth — access (15 min) + refresh (7 days) with hash storage and rotation

**Frontend Contributions (Jaya Vardhan):**
- React 18 frontend — 8 pages, React Router v6, all connected to live API
- AuthContext + ProtectedRoute — client-side auth flow with loading state guard
- Axios interceptor — concurrent request queuing on 401 → auto-refresh → retry

**Testing Contributions (Sravani):**
- Full Postman test suite — all 15 endpoints verified
- Smoke tests across complete user journeys (register → book → view → logout)
- Bug verification: caught `num_players` missing field, ISO date corruption fix

**Tech used that wasn't taught in class:**
- JWT refresh token rotation with hash storage
- Axios interceptor with concurrent request queuing
- Joi schema validation middleware pattern
- PostgreSQL connection pooling with Aiven SSL
- React Context + ProtectedRoute pattern
- Soft deletes + UUID PKs in production schema design

> **Speaker Note:** "The goal was to build something real — not a tutorial clone. Every decision made — UUID keys, soft deletes, the two-token auth pattern, the Axios interceptor queue — is how production applications at companies like Swiggy, Razorpay, and Zepto are built. This is the architecture we'd use if Eagle Box Cricket went live tomorrow."

📸 *Screenshot: Final app — Home, Login, Dashboard, Booking, MyBookings all visible as a collage*

---

# Presenter Notes — Timing Guide

| Slide | Time | Key Point |
|-------|------|-----------|
| 1 — Title | 0:30 | Introduce yourself and team scope |
| 2 — Scope | 0:45 | What's in, what's deliberately out |
| 3 — Team Roles | 0:45 | Who built what |
| 4 — Architecture | 1:00 | Two services, cloud DB |
| 5 — Database | 1:30 | 4 tables, UUIDs, soft delete, constraints |
| 6 — API | 1:30 | 15 endpoints, middleware stack |
| 7 — Auth | 1:30 | Dual token, refresh rotation, RBAC |
| 8 — Frontend | 1:00 | 8 pages, Context, ProtectedRoute |
| 9 — Booking | 1:00 | 3-step flow, API call shown |
| 10 — Engineering | 1:00 | Interceptor queue, parallel COUNT |
| 11 — Challenges | 0:30 | Real bugs, real fixes |
| 12 — Demo | 3:00 | Live walkthrough |
| 13 — Status | 0:30 | Done vs future scope |
| 14 — Q&A | As needed | Use prepared answers |
| 15 — Summary | 1:00 | Team deliverables, tech used |

**Total: ~12 minutes + Q&A**

---

# Gamma AI Formatting Note

Paste each `# Slide N —` section as a separate slide in Gamma. Use:
- The bold headers as slide titles
- Bullet points as body content
- Code blocks as code cards
- Speaker Notes as presenter notes (toggle in Gamma settings)
- 📸 prompts as image placeholder reminders

Recommended Gamma theme: **Dark / Minimal** with accent color `#BFFF00`
