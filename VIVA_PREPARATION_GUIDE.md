# Eagle Box Cricket — Role-Based Viva Preparation Guide
### Internship Week 3 Review | June 2026
**Team:** Jaya Vardhan (Frontend) · Sathwika (Backend) · Sravani (Tester/QA)

---

# PART 1 — ROLE RESPONSIBILITIES

---

## 1.1 Frontend Developer — Jaya Vardhan

### What Was Implemented
A complete single-page React application with 8 screens, client-side routing, JWT-based authentication flow, Axios API integration layer, and a fully connected 3-step booking workflow — all without any external UI library.

### Files and Modules Owned

| File | Purpose |
|------|---------|
| `frontend/src/api/axios.js` | Configured Axios instance with JWT interceptors and refresh token queue |
| `frontend/src/api/auth.api.js` | login, register, logout, getMe, updateMe functions |
| `frontend/src/api/slots.api.js` | getSlots function |
| `frontend/src/api/bookings.api.js` | createBooking, getMyBookings functions |
| `frontend/src/context/AuthContext.jsx` | Global auth state, login/logout/updateProfile methods |
| `frontend/src/components/layout/ProtectedRoute.jsx` | Auth guard with loading state |
| `frontend/src/components/layout/TopBar.jsx` | Sticky header with back/logo, optional title, avatar |
| `frontend/src/components/layout/BottomNav.jsx` | Fixed 4-tab bottom navigation |
| `frontend/src/pages/Home.jsx` | Public landing page |
| `frontend/src/pages/Login.jsx` | Login form with social login placeholders |
| `frontend/src/pages/Register.jsx` | Registration form |
| `frontend/src/pages/Dashboard.jsx` | Post-login home with stats and recent bookings |
| `frontend/src/pages/Booking.jsx` | 3-step slot booking flow |
| `frontend/src/pages/MyBookings.jsx` | Paginated booking history with filters |
| `frontend/src/pages/Profile.jsx` | View/edit profile, logout |
| `frontend/src/pages/NotFound.jsx` | 404 page |
| `frontend/src/utils/formatters.js` | formatCurrency, formatDate, formatTime, formatSlotTime, getNext7Days |
| `frontend/.env` | DANGEROUSLY_DISABLE_HOST_CHECK, BROWSER=none |
| `frontend/package.json` | React 18, react-router-dom v6, axios, react-scripts 5 |

### Technologies Used
- **React 18** — UI library
- **React Router v6** — Client-side routing (BrowserRouter, Routes, Navigate)
- **Axios** — HTTP client with request/response interceptors
- **React Context API** — Global auth state (no Redux)
- **CRA (react-scripts 5)** — Build toolchain and dev server
- **JetBrains Mono** — Monospace font for labels, stats, badges
- **Hanken Grotesk** — Body font
- **Inline JS style objects** — All styling (no Tailwind, no CSS-in-JS)
- **Material Symbols Outlined** — Icon set (Google CDN)
- **localStorage** — Token persistence (`ebc_access_token`, `ebc_refresh_token`)

### Features Built
1. **JWT Auth flow** — Login, Register, auto-login after register, token storage
2. **Token auto-refresh** — Axios interceptor queues concurrent requests during refresh
3. **ProtectedRoute** — Shows spinner during initial auth check, redirects if unauthenticated
4. **Slot browsing** — Date strip (next 7 days), slot grid grouped by Morning/Prime session
5. **3-step booking** — Select → Overview (player stepper 1–22) → Confirmation screen
6. **Booking history** — Filter tabs, pagination, status badges (colour-coded)
7. **Profile management** — Edit name/phone, initials avatar, role badge, sign out
8. **Background images** — Full-coverage bg + overlay + content z-index pattern
9. **Date/time formatting** — ISO-safe formatters (handles both `YYYY-MM-DD` and full ISO strings)
10. **404 page** — "OUT OF BOUNDS" with home/back buttons

### Key Decisions Made
- Used React Context instead of Redux (sufficient for Phase 1 scope)
- Concurrent token refresh queue pattern to prevent race conditions on 401
- No external UI component library (lighter bundle, full design control)
- `ProtectedRoute` checks `loading` state before redirecting (prevents flash-of-login)
- Tokens stored in `localStorage` (not cookies) for simplicity in Phase 1
- Inline styles follow existing codebase convention

---

## 1.2 Backend Developer — Sathwika

### What Was Implemented
A production-grade REST API with JWT dual-token authentication, PostgreSQL schema with 6 tables, 15 endpoints across auth/slots/bookings, full middleware stack (helmet → cors → rate-limit → validation), database transactions, audit logging, booking status transition validation, and Swagger documentation.

### Files and Modules Owned

| File | Purpose |
|------|---------|
| `api/server.js` | Express app bootstrap, middleware registration, route mounting |
| `api/src/config/database.js` | PostgreSQL connection pool (pg, max 10 connections) |
| `api/src/config/migrate.js` | Runs 001_initial_schema.sql against DB |
| `api/src/config/seed.js` | Seeds admin user, customer user, 48 slots |
| `api/migrations/001_initial_schema.sql` | All table definitions, constraints, indexes |
| `api/src/utils/jwt.utils.js` | signAccess, signRefresh, verifyAccess, verifyRefresh, hashToken |
| `api/src/utils/bcrypt.utils.js` | hash (12 rounds), compare using bcryptjs |
| `api/src/middleware/authenticate.js` | Verifies Bearer token, sets req.user |
| `api/src/middleware/authorize.js` | Role check middleware (admin/customer) |
| `api/src/middleware/validate.js` | Joi schema wrapper middleware |
| `api/src/middleware/errorHandler.js` | Global error handler, maps PG error codes |
| `api/src/middleware/audit.js` | Logs write operations to audit_logs table |
| `api/src/routes/auth.routes.js` | Auth route definitions + Joi schemas |
| `api/src/routes/booking.routes.js` | Booking route definitions + Joi schemas |
| `api/src/routes/slot.routes.js` | Slot route definitions + Joi schemas |
| `api/src/controllers/auth.controller.js` | Auth request handlers |
| `api/src/controllers/booking.controller.js` | Booking request handlers |
| `api/src/controllers/slot.controller.js` | Slot request handlers |
| `api/src/services/auth.service.js` | Auth business logic (register, login, refresh, logout) |
| `api/src/services/booking.service.js` | Booking business logic (create, list, status update) |
| `api/src/services/slot.service.js` | Slot business logic (list, create, update, delete) |
| `api/src/models/user.model.js` | User DB queries |
| `api/src/models/booking.model.js` | Booking DB queries |
| `api/EagleBox.postman_collection.json` | Postman collection for all endpoints |
| `api/package.json` | All backend dependencies |
| `api/.env.example` | All required environment variables documented |

### Technologies Used
- **Node.js + Express v4.18** — HTTP server and routing
- **PostgreSQL** (Aiven cloud, SSL) — Primary database
- **pg v8.11** — PostgreSQL driver, connection pool
- **jsonwebtoken v9.0.2** — JWT sign/verify (HS256)
- **bcryptjs v2.4.3** — Password hashing (12 rounds)
- **Joi v17.13.1** — Request validation schemas
- **helmet v7.1** — HTTP security headers
- **cors v2.8** — Cross-origin configuration
- **express-rate-limit v7.3** — 100 req / 15 min per IP
- **dotenv v16.4** — Environment variable loading
- **swagger-jsdoc + swagger-ui-express** — API documentation at `/api/docs`
- **nodemailer** — Email (installed, Phase 2)
- **razorpay** — Payments (installed, Phase 2)
- **nodemon** — Dev server auto-reload

### Features Built
1. **JWT dual-token auth** — Access (15m) + Refresh (7d), separate secrets, HS256
2. **Refresh token rotation** — Old token revoked on each refresh, stored as SHA-256 hash
3. **bcrypt password hashing** — 12 rounds (higher than standard 10 for security)
4. **RBAC middleware** — `authorize('admin')` / `authorize('customer')` on any route
5. **Joi validation middleware** — Reusable wrapper, `abortEarly: false`, `stripUnknown: true`
6. **6-table PostgreSQL schema** — users, refresh_tokens, slots, bookings, booking_events, audit_logs
7. **UUID primary keys** — All tables use `gen_random_uuid()`, no sequential IDs
8. **Soft deletes** — `is_deleted` + `deleted_at` on users, slots, bookings
9. **Booking status transitions** — Validated via VALID_TRANSITIONS map (not free-form)
10. **Database transactions** — Booking creation atomically updates slot status + inserts event
11. **Pagination with parallel COUNT** — `Promise.all([dataQuery, countQuery])` for efficiency
12. **Overlap detection** — Slot creation checks for time conflicts on same date
13. **Audit logging** — All write operations stored in audit_logs with IP, user-agent, JSONB diffs
14. **Swagger docs** — All 15 endpoints documented with request/response schemas
15. **Global error handler** — Maps PostgreSQL error codes 23505/23503 to proper HTTP codes

### Key Decisions Made
- PostgreSQL over MySQL/MongoDB (relational structure, FK integrity, JSONB for audit)
- Aiven cloud hosting (production-grade, SSL enforced, no local DB setup)
- 12 bcrypt rounds (over standard 10) for stronger security
- Refresh tokens stored as SHA-256 hash (never raw token in DB)
- Separate JWT secrets for access and refresh tokens
- `authorize()` as a separate middleware function (not merged into authenticate)
- Soft deletes on all tables (audit trail never lost)
- `booking_events` table to track every status change with timestamps
- `Promise.all()` for pagination count query (single round-trip to DB)
- `abortEarly: false` in Joi (return all validation errors at once)

---

## 1.3 Tester / QA Engineer — Sravani

### What Was Implemented
A complete test suite of 35 test cases across 10 categories covering the Phase 1 implementation: authentication, JWT flow, slot operations, booking lifecycle, admin booking management, protected route enforcement, frontend E2E flows, and security. All test cases were verified using Postman and browser testing, and documented in `tests/test-cases.md`.

### Files and Modules Owned

| File | Purpose |
|------|---------|
| `tests/test-cases.md` | 35 documented test cases with category, input, expected, actual, status |
| `api/EagleBox.postman_collection.json` | Postman collection (used for API testing) |

### Technologies Used
- **Postman** — API request testing tool (all Phase 1 endpoints tested)
- **Browser DevTools** — Frontend E2E observation
- **Manual test execution** — For UI flow testing

### Features Tested

**Category breakdown:**

| Category | Test Cases | TC Range | What Was Verified |
|----------|-----------|----------|-------------------|
| Auth — Registration & Login | 6 | TC-01 – TC-06 | Valid register, missing field, weak password, duplicate email, valid login, wrong password |
| JWT & Refresh Token | 4 | TC-07 – TC-10 | No token → 401, valid token → 200, valid refresh → new tokens, invalid refresh → 401 |
| User Profile | 2 | TC-11 – TC-12 | GET /auth/me returns user object, PATCH /auth/me updates name and phone |
| Slots | 3 | TC-13 – TC-15 | GET with date filter, no filter, date with no available slots |
| Booking | 5 | TC-16 – TC-20 | Create valid, missing num_players, double-booking, invalid slot ID, past slot date |
| Admin Booking Mgmt | 4 | TC-21 – TC-24 | Confirm pending, cancel confirmed, invalid transition, customer attempts admin → 403 |
| Slots Admin | 3 | TC-25 – TC-27 | Create slot, delete available slot, delete slot with active booking (blocked) |
| Frontend E2E | 5 | TC-28 – TC-32 | Home loads with live slots, login redirect, full 3-step booking flow, My Bookings view, Profile view/edit |
| Security | 2 | TC-33 – TC-34 | SQL injection on /slots → Joi blocks it, empty POST body → 400 validation errors |
| Integration | 1 | TC-35 | Register → login → book slot → slot in My Bookings → admin confirms via API → status updates |

**Total: 35 test cases — all PASS**

### Key Decisions Made
- Tested both positive (happy path) and negative (error/edge) cases for each endpoint
- Included security test cases (SQL injection, empty body) beyond functional testing
- Documented test cases in a structured table format for traceability
- Verified booking lifecycle transitions (pending → confirmed → completed)
- Tested double-booking prevention (same slot, second booking attempt)
- Verified frontend E2E flows independently from backend API tests

---

# PART 2 — ROLE-SPECIFIC VIVA QUESTIONS

---

## 2.1 Frontend Developer (Jaya Vardhan)

---

### Basic Questions

---

**Q: What is React and why was it used for this project?**

**Answer:** React is a JavaScript library for building user interfaces using reusable components. It was used because it enables fast, reactive UI updates through its virtual DOM — when booking state changes (e.g. step from 'select' to 'done'), only the affected component re-renders. It also has a large ecosystem, and the team had prior familiarity with it.

**Follow-up:** What is the virtual DOM and how does it differ from the real DOM?
> The virtual DOM is an in-memory representation of the real DOM. React diffs the old and new virtual DOM trees, then only applies the minimal set of real DOM changes needed. This is faster than re-rendering the entire page.

---

**Q: What is React Router and which version was used?**

**Answer:** React Router is a library for client-side navigation in React apps. Version 6 was used. It provides `<Routes>`, `<Route>`, `<Navigate>`, and `useNavigate()`. In this project it handles 8 routes including protected ones that redirect unauthenticated users to `/login`.

**Follow-up:** What is the difference between `<Link>` and `useNavigate()`?
> `<Link>` renders an anchor element and is used in JSX for declarative navigation. `useNavigate()` returns a function used for programmatic navigation inside event handlers or effects.

---

**Q: What is the difference between state and props in React?**

**Answer:** Props are read-only values passed from a parent component to a child. State is mutable data managed inside a component using `useState`. In this project, `numPlayers` in Booking.jsx is state (the user changes it), while the `title` passed to `TopBar` is a prop.

**Follow-up:** When does a component re-render?
> When its state changes, when its props change, or when its parent re-renders (unless memoised with React.memo).

---

**Q: What is `useEffect` and where was it used in this project?**

**Answer:** `useEffect` runs side effects after render — data fetching, subscriptions, timers. In this project: Dashboard.jsx calls `getMyBookings()` on mount; Booking.jsx calls `getSlots()` whenever the selected date changes; AuthContext listens for the `auth:logout` window event and initialises auth state on mount.

**Follow-up:** What does the dependency array in useEffect do?
> It controls when the effect runs. Empty array `[]` — runs only once on mount. Values in array — runs when any value changes. No array — runs after every render.

---

### Intermediate Questions

---

**Q: What is React Context and how is it used in AuthContext?**

**Answer:** React Context provides a way to pass data through the component tree without prop-drilling at every level. `AuthContext` stores `user`, `loading`, `isAuthenticated`, `isAdmin` and the `login`, `logout`, `updateProfile` functions. Any component can access these via `useAuth()` without having to receive them as props from a parent.

**Follow-up:** Why was Context chosen over Redux for this project?
> Auth state is simple — it only changes on login, logout, and profile update. Redux adds boilerplate (actions, reducers, store setup) that would be overkill for a single-concern global state. Context is built into React and sufficient for Phase 1.

---

**Q: Explain the ProtectedRoute component. What problem does it solve?**

**Answer:** ProtectedRoute wraps any page that requires authentication. It reads `loading` and `isAuthenticated` from AuthContext. If `loading === true` (auth check still in progress), it shows a spinner — this prevents the user from being incorrectly redirected to `/login` while the app is still verifying their stored token on page load. If `loading === false` and `isAuthenticated === false`, it redirects to `/login`. Otherwise it renders children.

**Follow-up:** What would happen if you removed the loading check?
> On page refresh, `user` is initially `null` before `getMe()` completes. Without the loading check, the user would always be redirected to `/login` on refresh, even if they have a valid token.

---

**Q: Explain the Axios token refresh interceptor — how does the request queue work?**

**Answer:** When an API call returns 401 (expired token), the response interceptor fires. If `isRefreshing` is already `true`, the failed request is pushed onto `failedQueue` as a promise. If `isRefreshing` is `false`, it sets the flag to `true` and calls POST `/api/v1/auth/refresh`. On success, it resolves all queued requests with the new token and retries the original. On failure, it rejects all queued requests, clears tokens, and dispatches `auth:logout`. Without the queue, three simultaneous 401s would trigger three parallel refresh calls — a race condition.

**Follow-up:** Where are the tokens stored and why?
> In `localStorage` under keys `ebc_access_token` and `ebc_refresh_token`. localStorage persists across page refreshes. The alternative, cookies with HttpOnly flag, would be more secure against XSS but requires backend cookie configuration — deferred to Phase 2.

---

**Q: How does the 3-step booking flow work in Booking.jsx?**

**Answer:** State variable `step` controls which view is shown: `'select'` | `'overview'` | `'done'`. In `select`, the user picks a date from the 7-day strip and clicks a slot tile. This sets `selectedSlot` and moves to `overview`. In `overview`, the user sees the slot details, adjusts `numPlayers` (1–22 stepper), and clicks CONFIRM. This calls `createBooking(slot_id, numPlayers)` and on success sets `booking` state and moves to `done`. The `done` step shows the booking reference and confirmation details.

**Follow-up:** Why is num_players validated on both frontend and backend?
> The frontend stepper prevents the user from entering invalid values (UI convenience and immediate feedback). The backend Joi schema re-validates because the frontend can be bypassed — any HTTP client can call the API directly. Backend validation is the authoritative check.

---

### Advanced Questions

---

**Q: Explain the ISO date handling bug that was discovered and how it was fixed.**

**Answer:** The `slot_date` field from the API comes back as a full ISO datetime string like `"2026-06-16T18:30:00.000Z"` — not a plain date. The original `formatDateShort` function did `new Date(dateStr + 'T00:00:00')`, which produced `new Date("2026-06-16T18:30:00.000ZT00:00:00")` — an invalid date string. The fix adds a branch: `dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')`. This handles both plain dates from manual input and ISO timestamps from the API.

**Follow-up:** Why does adding 'T00:00:00' matter for plain dates?
> `new Date("2026-06-16")` is interpreted as UTC midnight, which can shift the displayed date by one day in timezones behind UTC (India is UTC+5:30, so it would never show the wrong day, but it would in UTC-offset zones). Adding 'T00:00:00' forces local time interpretation.

---

**Q: What is the purpose of `DANGEROUSLY_DISABLE_HOST_CHECK=true` in the .env?**

**Answer:** CRA 5 uses webpack-dev-server v4, which validates the `Host` header of incoming requests against an `allowedHosts` list. Setting `HOST=localhost` in .env caused the allowed hosts list to contain an empty string — an invalid configuration that crashes the dev server. `DANGEROUSLY_DISABLE_HOST_CHECK=true` disables that validation entirely, which is acceptable in a local development environment. In production there is no dev server — the built static files are served directly.

**Follow-up:** What is the production build command and what does it produce?
> `npm run build` runs `react-scripts build`, producing a `build/` directory with minified, optimised static files — HTML, CSS, and JS bundles — that can be served by any static file server like Nginx.

---

### Project-Specific Questions

---

**Q: The Dashboard shows booking stats without the user needing to request them separately. How?**

**Answer:** Dashboard.jsx calls `getMyBookings({ limit: 50 })` on mount to fetch up to 50 bookings. The component then computes stats client-side: `total = list.length`, `confirmed = list.filter(b => b.status === 'confirmed' || b.status === 'completed').length`, `pending = list.filter(b => b.status === 'pending').length`. The first 3 bookings are displayed as "recent". This avoids a separate stats API call at the cost of fetching slightly more data.

---

**Q: How does the HOT badge appear on slot tiles in the booking screen?**

**Answer:** In `Booking.jsx`, the `SlotTile` component checks `isHot = slot.price > 1000`. If `isHot && available`, it renders a `🔥 HOT` badge absolutely positioned on the tile. The threshold of ₹1000 is hardcoded in the frontend — it's a display-only feature with no backend counterpart.

---

**Q: What happens when a user's refresh token expires while they are using the app?**

**Answer:** The Axios interceptor catches the 401 from the original API call. It attempts POST `/api/v1/auth/refresh` with the stored refresh token. The backend verifies the token — if it's expired or revoked, it returns 401 again. The interceptor detects a failed refresh (second 401), calls `clearAuth()` to remove tokens from localStorage, sets `user` to null in AuthContext, and dispatches a custom `auth:logout` window event. The AuthContext listener clears state, causing the ProtectedRoute to redirect the user to `/login`.

---

## 2.2 Backend Developer (Sathwika)

---

### Basic Questions

---

**Q: What is Express.js and why was it chosen?**

**Answer:** Express is a minimal, unopinionated Node.js web framework. It was chosen because it's lightweight (adds almost no overhead over raw Node HTTP), has a vast middleware ecosystem, and gives full control over the request/response cycle. For a REST API with clear route requirements like this project, Express is standard in the industry.

**Follow-up:** What is middleware in Express?
> A function with signature `(req, res, next)` that sits in the request pipeline. It can inspect, modify, or terminate the request. `next()` passes control to the next middleware. Example: `authenticate` middleware reads the Bearer token and adds `req.user` before the controller runs.

---

**Q: What is PostgreSQL and why was it chosen over MongoDB or MySQL?**

**Answer:** PostgreSQL is a relational database. It was chosen because bookings have inherently relational data — a booking belongs to a user AND a slot, and a JOIN query retrieves them together. MongoDB would require `$lookup` aggregations for the same result. Unlike MySQL, PostgreSQL supports `UUID` generation natively via `gen_random_uuid()`, `JSONB` for audit log metadata, and has stronger standards compliance. The project uses Aiven-hosted PostgreSQL with SSL for production readiness.

**Follow-up:** What is a connection pool and why is max set to 10?
> A connection pool keeps a set of pre-established database connections that queries reuse instead of opening a new connection per request. Opening a TCP connection is expensive. Max 10 matches Aiven's free tier limit and prevents exhausting the database's connection budget.

---

**Q: What is bcrypt and why use it for passwords?**

**Answer:** bcryptjs is a password hashing library. Passwords are never stored in plaintext — they're passed through a one-way hashing function with a configurable cost factor (rounds). This project uses 12 rounds. Bcrypt is resistant to rainbow table attacks because it incorporates a random salt per hash. To verify a password, `bcrypt.compare(plaintext, hash)` recomputes the hash and compares — it cannot reverse the hash.

**Follow-up:** Why 12 rounds instead of the default 10?
> More rounds means more CPU time per hash attempt. 12 rounds is still fast enough for login (< 1 second) but makes brute-force attacks significantly more expensive. Each extra round doubles the computation time.

---

**Q: What does Joi do and why use it instead of manual `if` checks?**

**Answer:** Joi is a schema validation library. Instead of writing `if (!req.body.email) return 400`, you declare a schema once and Joi validates type, format, required fields, patterns, and ranges. `abortEarly: false` collects ALL errors at once. `stripUnknown: true` removes unexpected fields from the request. The `validate` middleware wraps Joi into one reusable function that any route uses with a single `validate(schema)` call — no repeated validation code.

**Follow-up:** Where does the validate middleware apply the schema — to the body, query, or both?
> The middleware accepts a `source` parameter: `validate(schema, 'body')` for POST/PATCH bodies, `validate(querySchema, 'query')` for GET query strings. Example: `GET /slots?date=2026-06-20` validates the query string; `POST /bookings` validates the body.

---

### Intermediate Questions

---

**Q: Explain the dual-token JWT authentication pattern. Why two tokens?**

**Answer:** Two separate JWT tokens serve different purposes. The **access token** (15 minutes, short-lived) is sent with every API request. If it's stolen, the attacker can only misuse it for 15 minutes. The **refresh token** (7 days, long-lived) is only sent to `POST /auth/refresh` to get a new access token. It's stored as a SHA-256 hash in the `refresh_tokens` table — so even if the database is breached, the attacker cannot replay the token (they'd need to reverse the hash). On logout, the refresh token hash is marked `is_revoked = TRUE`, immediately invalidating the session.

**Follow-up:** What would happen if you used only one long-lived token?
> A stolen token would be valid for days or weeks with no way to revoke it (JWTs are stateless). The dual-token pattern limits the stolen token window to 15 minutes.

---

**Q: What is RBAC and how is it implemented in this project?**

**Answer:** Role-Based Access Control restricts API access based on the user's role. In this project, roles are `'admin'` and `'customer'`. After `authenticate()` middleware verifies the JWT and sets `req.user = { id, email, role }`, the `authorize('admin')` middleware checks `req.user.role === 'admin'` — if not, it returns `403 Forbidden`. Admin-only routes include slot creation/deletion and viewing all bookings. Customer routes include creating bookings and viewing their own.

**Follow-up:** Can a customer access `GET /api/v1/bookings` (all bookings)?
> No. That route has `authorize('admin')` middleware. A customer's JWT has `role: 'customer'`, which fails the check and returns 403 before the controller runs.

---

**Q: How does booking creation use a database transaction and why?**

**Answer:** Creating a booking involves three operations that must all succeed or all fail atomically:
1. `INSERT INTO bookings` — creates the booking record
2. `UPDATE slots SET status = 'booked' WHERE id = slot_id` — marks slot as unavailable
3. `INSERT INTO booking_events` — records the BOOKING_CREATED event

If the slot update fails after the booking is inserted, the system would have a booking pointing to a still-available slot — data inconsistency. A transaction wraps all three: if any step fails, the entire transaction is rolled back. No partial writes exist.

**Follow-up:** How do you run a transaction with the pg library?
> Acquire a client from the pool with `pool.connect()`, run `BEGIN`, execute the queries, then `COMMIT` or `ROLLBACK` on error, and release the client back to the pool in a `finally` block.

---

**Q: Explain soft deletes — what are they and why use them?**

**Answer:** Instead of `DELETE FROM users WHERE id = $1`, soft delete runs `UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1`. The row stays in the database. All queries add `WHERE is_deleted = FALSE` to filter out deleted records. Benefits: booking history is never lost (a deleted user's bookings remain), accidental deletions are recoverable, and audit trails remain complete. The trade-off is queries need the extra filter condition.

**Follow-up:** How does the slot delete check prevent data loss?**
> `deleteSlot()` in the slot service first checks if there are any bookings with status `pending` or `confirmed` for that slot. If any exist, it returns 400 Bad Request — the slot cannot be deleted while active bookings depend on it.

---

### Advanced Questions

---

**Q: What is the booking status transition validation and how is it implemented?**

**Answer:** Booking statuses follow defined transitions: `pending → confirmed|cancelled`, `confirmed → completed|cancelled`. `completed` and `cancelled` are terminal states. In `booking.service.js`, a `VALID_TRANSITIONS` map defines what each status can transition to. When `updateBookingStatus()` is called, it fetches the current booking, looks up `VALID_TRANSITIONS[currentStatus]`, and checks if the requested new status is in the allowed list. If not, it returns 400. This prevents an admin from accidentally marking a `completed` booking as `pending` again.

**Follow-up:** Why not just validate this in the Joi schema?
> Joi validates the shape of the input — it can confirm `status` is one of the valid enum values. But Joi cannot check what the current status is because that requires a database query. Business rule validation (current state → allowed transitions) must happen in the service layer.

---

**Q: How does the slot overlap check work?**

**Answer:** When creating or updating a slot, the slot service queries existing slots for the same date: `WHERE slot_date = $1 AND is_deleted = FALSE AND id != $existingId AND start_time < $newEndTime AND end_time > $newStartTime`. The condition `start_time < newEnd AND end_time > newStart` is the standard interval overlap detection formula — two time ranges overlap if and only if one starts before the other ends AND the other starts before it ends.

**Follow-up:** What HTTP status code does overlap return?
> 409 Conflict — the request is valid but conflicts with existing data.

---

**Q: How is the booking reference generated and what ensures uniqueness?**

**Answer:** The booking reference uses the format `'EBC' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2, 5)`. `Date.now().toString(36)` converts the current timestamp to base-36 (uses letters+digits), slicing the last 6 chars gives a time-ordered component. The random suffix adds collision resistance. The `booking_ref` column has a `UNIQUE` constraint in the database — if an astronomically unlikely collision occurs, the database will throw error code 23505, which the error handler maps to 409. In practice, the combination of timestamp + random makes collision effectively impossible.

---

### Project-Specific Questions

---

**Q: How is the audit log table populated and what information does it capture?**

**Answer:** The `auditMiddleware` wraps the response's `json()` method. After the controller sends a response, if the response status is < 400 and `req.user` exists, it inserts into `audit_logs`: `user_id`, `action` (e.g. BOOKING_CREATED), `entity_type` (e.g. booking), `entity_id`, `old_values` (JSONB), `new_values` (JSONB), `ip_address` (`req.ip`), `user_agent` (`req.headers['user-agent']`). This creates an immutable audit trail of every change made by authenticated users.

---

**Q: What PostgreSQL error codes does the error handler map and why?**

**Answer:** Two codes: `23505` (unique_violation) → 409 Conflict (e.g. duplicate email/phone on register, duplicate slot time, duplicate booking_ref). `23503` (foreign_key_violation) → 400 Bad Request (e.g. booking references a non-existent slot_id). Without this mapping, both would fall through to the generic 500 handler and expose the raw PG error message — which reveals DB schema details. Mapping them to appropriate HTTP codes both hides implementation details and provides meaningful responses to the client.

---

**Q: The seed script creates 48 slots. How exactly are they generated?**

**Answer:** For today plus the next 7 days (8 days total), 6 time slots are created per day: 06:00–07:30, 08:00–09:30, 10:00–11:30, 14:00–15:30, 16:00–17:30, and 18:00–19:30. All at ₹600 with status `available`, created by the admin user. 8 days × 6 slots = 48 slots. The script also handles the case where slots already exist (upsert or skip) to allow re-seeding safely.

---

## 2.3 Tester / QA Engineer (Sravani)

---

### Basic Questions

---

**Q: What is the difference between functional testing and non-functional testing?**

**Answer:** Functional testing verifies that features work as specified — does `POST /bookings` with valid data create a booking? Does double-booking return 409? Non-functional testing covers quality attributes — is the API fast enough, does it handle SQL injection, does it rate-limit? This project's test suite covers both: the 35 test cases include functional tests (booking creation, auth flow, slot filtering) and non-functional tests (SQL injection attempt, empty POST body security test).

**Follow-up:** Which of the 35 test cases are non-functional?
> Two Security test cases (TC-33 and TC-34): SQL injection attempt on the slots endpoint, and empty POST body validation test.

---

**Q: What is Postman and how was it used to test this project?**

**Answer:** Postman is an API testing tool that lets you send HTTP requests and inspect responses without writing code. It was used to test all 15 endpoints of the Eagle Box Cricket API — setting headers (Authorization: Bearer token), request bodies (JSON), and verifying response status codes, response body fields, and error messages. The `EagleBox.postman_collection.json` file captures all these requests and can be imported into Postman by anyone on the team.

**Follow-up:** How do you handle authentication in Postman when testing protected endpoints?
> First call `POST /auth/login` to get the access token. Copy the `accessToken` from the response and set it as the Bearer token in the Authorization header for subsequent protected requests. In a Postman Collection, you can store the token as an environment variable and auto-inject it via collection-level auth settings.

---

**Q: What is a test case and what are its components?**

**Answer:** A test case is a documented set of conditions, inputs, and expected outputs for testing a specific feature. The test cases in this project include: Category, Test Case Name, Input data/request, Expected Result (status code + response body shape), Actual Result, and Status (PASS/FAIL). For example: TC-17 "Create Booking — Missing num_players" — Input: POST /bookings with only slot_id — Expected: 422, validation error — Actual: 422, "num_players is required" — Status: PASS.

**Follow-up:** What is the difference between expected result and actual result?
> Expected result is written before testing based on requirements/specifications. Actual result is what the system actually returned during the test run. They must match for a PASS. If they differ, it's a FAIL and a bug report is raised.

---

**Q: What is the difference between positive and negative test cases?**

**Answer:** Positive test cases verify the happy path — valid inputs producing correct outputs (e.g. register with all valid fields returns 201 with user object and tokens). Negative test cases verify error handling — invalid inputs are rejected correctly (e.g. register with missing phone returns 400 with "phone is required" error). Both are essential: positive cases confirm features work; negative cases confirm the system fails safely and informatively.

**Follow-up:** Give an example of a negative test case from this project.
> TC-18: "Book already-booked slot" — Input: `POST /bookings` with `slot_id` of a slot whose status is already `'booked'` — Expected: 409 Conflict, "Slot is not available" — Actual: 409 Conflict — Status: PASS.

---

### Intermediate Questions

---

**Q: What is the booking lifecycle and how was each status transition tested?**

**Answer:** The booking lifecycle is: `pending → confirmed → completed` or `pending → cancelled` or `confirmed → cancelled`. Each transition was tested with a PUT /bookings/:id/status request. Additionally, invalid transitions were tested: TC-23 attempts to move a `completed` booking back to `pending` — expected 400 (invalid transition), actual 400 — PASS. This verifies the VALID_TRANSITIONS enforcement in the backend service.

**Follow-up:** What happens to the slot's status when a booking is cancelled?
> The slot status is reset from `'booked'` to `'available'` atomically in the same database transaction as the booking status update. This was verified: after cancellation, calling `GET /slots?date=X` showed the slot as `available` again.

---

**Q: How was the double-booking prevention tested?**

**Answer:** Test case TC-18: First, a booking was created successfully for a specific slot. Then, a second `POST /bookings` request was made with the same `slot_id`. Expected result: 409 Conflict with message "Slot is not available". Actual result: 409 — PASS. This verifies the slot status check in the booking service and the atomic slot status update in the transaction.

**Follow-up:** Is there a race condition risk if two users book the same slot simultaneously?
> This is a valid concern. The booking service wraps the slot availability check and the booking insert in a database transaction with appropriate locking. The `UPDATE slots SET status = 'booked' WHERE id = $1 AND status = 'available'` is atomic — only one transaction can succeed; the other will find the slot no longer available.

---

**Q: What security tests were performed and what did they verify?**

**Answer:** Two security test cases: (1) SQL injection on `GET /slots?date='; DROP TABLE slots; --'` — expected: 400 validation error (Joi rejects the malformed date), NOT a SQL error — actual: 400 — PASS. This verifies that Joi's date pattern validation blocks injection before it reaches the query layer, and that parameterised queries in pg would prevent execution even if it got through. (2) Empty POST body on `POST /bookings` — expected: 400 with validation errors — actual: 400 — PASS. This verifies error handling for completely missing request data.

**Follow-up:** What is a parameterised query and why does it prevent SQL injection?
> A parameterised query separates SQL code from data: `SELECT * FROM users WHERE email = $1` with parameter `['malicious@sql.com']`. The database driver treats `$1` as data, never as SQL code. Even if the value contains SQL syntax like `'; DROP TABLE --`, it is safely escaped. The pg library uses parameterised queries by default.

---

### Advanced Questions

---

**Q: What is end-to-end (E2E) testing and how was it performed in this project?**

**Answer:** E2E testing tests the complete user journey through the system — from the browser through the frontend through the API to the database, and back. The 5 Frontend E2E test cases in this project covered: home page loading with live slot tiles, login redirecting to Dashboard, the full 3-step booking flow (select date → select slot → confirm → booking reference displayed), My Bookings page showing the new booking with correct status, and the Profile page loading user data and persisting a name update. These were performed manually using the browser while both servers were running.

**Follow-up:** What is the difference between E2E testing and API testing?
> API testing (Postman) tests the backend in isolation — it bypasses the frontend entirely, sending raw HTTP requests. E2E testing validates that the frontend correctly integrates with the backend — the UI renders correctly, button clicks trigger the right API calls, and responses update the UI as expected.

---

**Q: What is regression testing and would it be relevant here?**

**Answer:** Regression testing re-runs existing test cases after new code changes to ensure that new features haven't broken existing ones. In this project, after fixing the `num_players` validation bug (adding the player stepper to the UI), the booking test cases would be re-run to confirm the fix works AND that it didn't break other booking-related features like slot selection or the confirmation screen. Currently tests are manual — in Phase 2, automated regression tests with a tool like Jest or Cypress would be more efficient.

---

### Project-Specific Questions

---

**Q: The test-cases.md shows 35 tests and all PASS. How was the `num_players` bug discovered if tests were already passing?**

**Answer:** The `num_players` bug (POST /bookings failing because the frontend wasn't sending `num_players`) was discovered during integration testing — when the frontend and backend were connected and tested together. TC-16 (`POST /bookings` with a Postman request that included `num_players`) passed. TC-30 (the full 3-step booking flow in the browser) failed because the UI wasn't sending the field. This demonstrates why both API testing and frontend E2E testing are necessary — API tests can pass while the integration fails.

---

**Q: How did you verify that the refresh token flow works correctly?**

**Answer:** TC-09 and TC-10 cover this. TC-09: with a valid, unexpired refresh token in the request body, POST /api/v1/auth/refresh returns 200 with a new `accessToken` and `refreshToken` pair. The old refresh token hash is marked `is_revoked = TRUE` in the database (token rotation). TC-10: with an invalid or already-revoked token, the endpoint returns 401 — confirming the token is unusable after one use. In the frontend, the Axios interceptor was also validated manually: loading the Dashboard and My Bookings simultaneously after access token expiry queues both requests, triggers one refresh call, and retries both with the new token without either request failing.

---

# PART 3 — COMMON TEAM QUESTIONS

*(Any team member should be able to answer these)*

---

**Q: What problem does Eagle Box Cricket solve?**

**Answer:** Eagle Box Cricket is a manual, phone/walk-in based booking system for a box cricket venue in Hyderabad. Customers couldn't check slot availability online, couldn't book without calling, and the venue had no way to manage bookings digitally. This project builds a digital platform: customers can see real-time slot availability, book online in 3 steps, and track their booking history. The venue admin can manage slots and confirm/cancel bookings through the API.

---

**Q: Explain the overall system architecture.**

**Answer:** The project follows a 2-tier client-server architecture. The **frontend** is a React 18 SPA running on port 3000 — it communicates exclusively through Axios HTTP requests. The **backend** is a Node.js/Express REST API running on port 5001, serving JSON at `/api/v1/*`. The backend connects to a **PostgreSQL** database hosted on Aiven Cloud (accessible over SSL). In development, CRA's dev server proxies `/api/*` requests from port 3000 to port 5001, eliminating CORS issues. In production, both would sit behind an Nginx reverse proxy.

---

**Q: Why PostgreSQL specifically — not MongoDB, not MySQL?**

**Answer:** Three reasons: (1) **Relational structure** — bookings have FK relationships to both users and slots; JOINs are natural in SQL. (2) **Data integrity** — FK constraints at the DB level enforce that a booking cannot reference a non-existent slot. MongoDB has no FK constraints. (3) **PostgreSQL-specific features** — `gen_random_uuid()` for UUID PKs without a library, `JSONB` columns for audit log metadata, `CHECK` constraints for role/status enums, and the composite UNIQUE constraint on `(slot_date, start_time)` preventing duplicate slots at the database level.

---

**Q: Why JWT authentication? Why not sessions?**

**Answer:** JWT is stateless — the server doesn't store session data. Any server instance can verify a token by checking its signature against the secret key. Sessions require a shared session store (Redis, database) across server instances, which adds infrastructure. JWT scales horizontally without shared state. The trade-off (harder token revocation) is addressed by the short 15-minute access token window and the DB-backed refresh token that can be explicitly revoked on logout.

---

**Q: Explain the complete booking workflow end-to-end.**

**Answer:**
1. User opens `GET /api/v1/slots?date=2026-06-20&status=available` — backend queries slots table filtered by date and status, returns paginated list.
2. User selects a slot → frontend moves to overview step, shows slot details.
3. User sets player count (1–22) → frontend calls `POST /api/v1/bookings` with `{ slot_id, num_players }`.
4. Backend: authenticate → authorize → validate(Joi) → booking service.
5. Booking service: fetches slot (404 if missing), checks status = 'available' (409 if not), verifies slot_date >= today (400 if past).
6. Transaction: INSERT booking (auto-generates EBC reference), UPDATE slot to 'booked', INSERT booking_event.
7. Response: booking object with `booking_ref`, `status: 'pending'`, `total_amount`.
8. Frontend shows confirmation screen with booking reference.

---

**Q: Explain the database design — why 6 tables?**

**Answer:**
- **users** — stores all user accounts with hashed passwords, roles, soft-delete flag
- **refresh_tokens** — stores hashed refresh tokens with expiry and revocation flag; enables logout and token rotation
- **slots** — time slots created by admin; composite UNIQUE on (date, start_time) prevents duplicates
- **bookings** — customer reservations; FK to users and slots; booking_ref is human-readable unique identifier
- **booking_events** — immutable log of every status change on a booking (BOOKING_CREATED, status transitions) — full lifecycle history
- **audit_logs** — system-wide log of all write operations by authenticated users with IP, user-agent, before/after JSONB values

The last two tables are separation-of-concerns decisions: booking_events tracks the business object lifecycle; audit_logs tracks the system security trail.

---

**Q: What is the future scope of the project (Phase 2)?**

**Answer:** Based on installed packages and schema tables that exist but aren't wired in Phase 1:
- **Payment integration** — Razorpay package is installed (`razorpay v2.9.2`); just needs a controller + route
- **Email notifications** — Nodemailer package is installed; booking confirmation emails on create/confirm
- **Admin dashboard** — Slot management UI, booking approval UI, revenue reports
- **Tournament registration** — Schema tables (tournaments, teams, team_registrations) exist in the DB
- **Customer self-cancellation** — Currently admin-only; UI + business rule needed
- **Membership system** — Schema tables (memberships, user_memberships) exist
- **Automated testing** — Jest unit tests for services, Cypress E2E tests

---

# PART 4 — REVIEWER SIMULATION

---

## 4.1 Top 20 Most Likely Viva Questions

| # | Question | Most Likely Asked To |
|---|---------|---------------------|
| 1 | Explain the overall architecture of your project | All |
| 2 | How does JWT authentication work in your project? | Sathwika |
| 3 | What does your database schema look like? How many tables and why? | Sathwika |
| 4 | Walk me through the booking flow from UI to database | All |
| 5 | What is React Context and why did you use it instead of Redux? | Jaya Vardhan |
| 6 | How did you prevent double booking? | Sathwika |
| 7 | What testing approach did you use? How many test cases? | Sravani |
| 8 | What is a ProtectedRoute and why is it needed? | Jaya Vardhan |
| 9 | How are passwords stored securely? | Sathwika |
| 10 | What is the role of middleware in your Express app? | Sathwika |
| 11 | How does the token refresh work in your frontend? | Jaya Vardhan |
| 12 | What bugs did you encounter and how did you fix them? | All |
| 13 | Why did you use soft deletes? | Sathwika |
| 14 | What is Joi validation and where did you apply it? | Sathwika |
| 15 | How did you test API endpoints? What tool? | Sravani |
| 16 | What is RBAC and how is it implemented? | Sathwika |
| 17 | What is the difference between the access token and refresh token? | All |
| 18 | How does pagination work in your API? | Sathwika |
| 19 | What security measures are in place? Name at least 5 | All |
| 20 | What would you add in Phase 2 and why? | All |

---

## 4.2 Top 10 Difficult Questions

---

**D1: How would your system handle 1000 concurrent booking requests for the same slot?**

**Answer:** The database transaction with `UPDATE slots SET status='booked' WHERE id=$1 AND status='available'` is atomic. PostgreSQL's row-level locking ensures only one transaction can update the row at a time. The others will wait, then find `status != 'available'` and return 409. The connection pool (max 10) would queue concurrent requests. In Phase 2, an optimistic locking pattern or Redis-based distributed lock would be more scalable. Rate limiting (100 req/15min) also reduces burst load.

---

**D2: Why store refresh tokens in the database? Doesn't that make JWT stateful?**

**Answer:** Partially, yes. Storing refresh token hashes introduces state. This is a deliberate trade-off: pure stateless JWT cannot be revoked before expiry. If a refresh token is compromised, you need a way to invalidate it — which requires a database check. Access tokens remain fully stateless (verified by signature only). Only the long-lived refresh token requires DB validation. This hybrid approach is the industry standard used by companies like Auth0 and Google.

---

**D3: What is the security risk of storing tokens in localStorage vs HttpOnly cookies?**

**Answer:** localStorage is accessible by JavaScript — XSS attacks that inject malicious script can steal tokens. HttpOnly cookies cannot be read by JavaScript — they're automatically sent by the browser and invisible to JS. For this Phase 1 project, localStorage was used for simplicity. In Phase 2, moving to HttpOnly cookies with SameSite=Strict + CSRF protection is the more secure approach. The existing Axios interceptor would be replaced with cookie-based auth.

---

**D4: Your rate limiter allows 100 requests per 15 minutes. What happens to legitimate users if an attacker sends 100 requests first?**

**Answer:** With IP-based rate limiting, the attacker's IP is throttled. Legitimate users have different IPs so they're unaffected. However, if an attacker controls the user's network or uses NAT, multiple users share one IP. The current implementation is basic. More sophisticated approaches include: per-user rate limiting (requires auth), sliding window instead of fixed window, different limits for auth endpoints vs read endpoints. This is a known limitation noted for Phase 2.

---

**D5: How does the Axios interceptor handle the case where the token refresh request itself takes 3 seconds and 50 API calls queue up?**

**Answer:** The `failedQueue` array accumulates all 50 calls as pending promises. The `isRefreshing` flag prevents 50 refresh calls. Once one refresh completes, `processQueue(null, newToken)` iterates the queue and resolves all 50 promises with the new token, which retry their original requests. The queue is bounded only by JavaScript's memory — in practice this is not a concern for a real user, but in theory a flood of API calls during refresh could grow the queue. A timeout on queued requests would be a Phase 2 improvement.

---

**D6: The booking_events table tracks all status changes. How would you query the full history of a specific booking?**

**Answer:** `SELECT event_type, from_status, to_status, created_at, notes FROM booking_events WHERE booking_id = $1 ORDER BY created_at ASC`. This returns the complete lifecycle: BOOKING_CREATED → STATUS_CHANGED (pending → confirmed) → STATUS_CHANGED (confirmed → completed), with timestamps and any admin notes. This table is currently populated but not exposed through a frontend UI — it would power a booking detail/history page in Phase 2.

---

**D7: What happens to a slot's status if a booking is cancelled after being confirmed?**

**Answer:** The `updateBookingStatus` service handles `confirmed → cancelled` as a valid transition. In the same database transaction that sets `booking.status = 'cancelled'`, it also runs `UPDATE slots SET status = 'available' WHERE id = slot_id`. This makes the slot bookable again. The booking_event table records the status change. This was verified in TC-22 (cancel confirmed booking → slot reverts to available).

---

**D8: How does Swagger documentation work — is it generated manually or automatically?**

**Answer:** It's generated from JSDoc comments in the route files using `swagger-jsdoc`. Each route has a JSDoc block with `@swagger` annotation describing the HTTP method, path, request body schema, and response schemas. At startup, `swagger-jsdoc` scans these annotations and generates an OpenAPI 3.0 JSON spec. `swagger-ui-express` serves that spec as an interactive UI at `/api/docs`. This means documentation stays in sync with the code — if you change a route, you update the JSDoc comment next to it.

---

**D9: You have an audit_logs table but no frontend to view it. What was its purpose in Phase 1?**

**Answer:** Audit logging was built into the backend from the start as a production-grade practice, even though no frontend consumes it in Phase 1. Every write operation by an authenticated user is recorded with: who (user_id), what (action), on what (entity_type, entity_id), what changed (old_values, new_values as JSONB), and from where (IP, user-agent). In Phase 2, an admin panel can query this table for compliance reporting, debugging, and security investigation. Building it from day 1 means the data exists from the start — retrofitting audit logging later misses historical records.

---

**D10: What does `abortEarly: false` and `stripUnknown: true` do in Joi configuration?**

**Answer:** `abortEarly: false` tells Joi to collect ALL validation errors before returning, not stop at the first failure. Without it, a user submitting a form with 3 invalid fields would see only the first error, fix it, resubmit, see the second, and so on — poor UX. With it, all errors are returned in one response. `stripUnknown: true` removes any fields in the request body that aren't defined in the schema. This prevents unknown fields from reaching controllers — a security measure against parameter pollution attacks where a malicious user sends extra fields like `role: 'admin'` hoping the controller uses `req.body` directly.

---

## 4.3 Role-Specific Reviewer Questions

### Questions for Jaya Vardhan (Frontend)

1. Show me the Network tab in DevTools during login — explain each request and response.
2. What happens when you refresh the browser on the Dashboard page?
3. How would you add a loading skeleton instead of the current spinner?
4. Why are tokens stored in localStorage and not cookies?
5. If you had to add an admin page, where would you add the route and how would you guard it?
6. Why does the Home page still show a "SIGN IN" button when the user is already logged in? *(Answer: It doesn't — it shows "DASHBOARD" if `isAuthenticated` is true)*
7. How does the bottom navigation highlight the active tab?

### Questions for Sathwika (Backend)

1. Open Swagger at localhost:5001/api/docs and demo a live API call.
2. What would happen if someone sends a negative number for `num_players`?
3. How would you add an endpoint to get a single booking by ID?
4. What is the purpose of the `trust proxy 1` setting in server.js?
5. Walk me through what happens in the database during a slot deletion.
6. What would you change to support multiple venues?
7. How would you rotate the JWT secret without logging everyone out?

### Questions for Sravani (QA)

1. Show me the test-cases.md and walk through 3 test cases in detail.
2. How did you set up the Authorization header in Postman for protected endpoints?
3. What would an automated test for the booking flow look like in pseudocode?
4. How do you test pagination — what inputs do you use?
5. If the booking creation returned 500 instead of 409 for a duplicate booking, how would you debug it?
6. What is the difference between your security test and a full penetration test?
7. How would you test the token refresh flow in Postman?

---

## 4.4 Teamwork & Collaboration Questions

---

**Q: How did the three of you coordinate? What was built first?**

**Answer:** The backend (API contract) was built first. Once the routes, request/response shapes, and error codes were defined, the frontend developer could build against those contracts — even before the backend was fully complete, Postman responses could be used as reference. The QA engineer tested as each module was completed rather than waiting for the full system. The Postman collection served as the shared contract document between all three roles.

---

**Q: How was the API contract communicated to the frontend developer?**

**Answer:** Through the Swagger documentation at `/api/docs` (live, interactive) and the `EagleBox.postman_collection.json` file. The Swagger UI shows exact request body schemas, required fields, response shapes, and example values. The frontend developer referenced this to build the Axios API modules — each function in `auth.api.js`, `slots.api.js`, and `bookings.api.js` maps to a documented endpoint.

---

**Q: Was there any bug that required both frontend and backend to fix together?**

**Answer:** Yes — the `num_players` validation failure. The backend Joi schema required `num_players` from the start. The frontend's initial booking flow only sent `slot_id`. The backend returned 422 "num_players is required" but the frontend's error handler tried `e.message` on a plain string array, showing the generic "Registration failed" message instead. The full fix required: (1) backend — confirmed the Joi schema was correct; (2) frontend — added the player count stepper UI component and updated the `createBooking()` API call; (3) frontend — fixed the error handler to handle plain string arrays in the errors array. Three changes across two layers.

---

**Q: What would you do differently if you started the project again?**

**Answer (suggested):** Write the API contracts (OpenAPI spec) before writing any code — design-first approach. Set up a shared `.env.example` earlier so no team member has a misconfigured environment. Start the frontend proxy config correctly from the beginning (port 5001, pointing to the right server). Add at least one automated integration test from day 1 so regressions are caught immediately. Consider HttpOnly cookies for auth tokens instead of localStorage.

---

# PART 5 — PRESENTATION PREPARATION

---

## 5.1 Frontend Developer — Jaya Vardhan

### Must Know Before Presentation

| Topic | Key Detail |
|-------|-----------|
| React 18 features used | Concurrent rendering, functional components, hooks |
| Axios interceptor logic | `isRefreshing` flag, `failedQueue` array, promise pattern |
| AuthContext pattern | Provider/Consumer, `useAuth()` hook, why Context |
| ProtectedRoute logic | `loading` state check, redirect vs render |
| 3-step booking flow | `step` state, what triggers each transition |
| Token storage keys | `ebc_access_token`, `ebc_refresh_token` in localStorage |
| formatters.js functions | formatCurrency (en-IN, INR), ISO date safety |
| Folder structure | api/, context/, components/layout/, pages/, utils/ |
| CRA proxy config | `"proxy": "http://localhost:5001"` in package.json |
| Background image pattern | Absolute positioned div + overlay div + content zIndex 2 |

### Can Safely Attribute to Another Team Member

- "The backend JWT token format was designed by Sathwika — the access token has a 15-minute expiry and the refresh token lasts 7 days."
- "The Joi validation schemas on the API side were built by Sathwika. I built the frontend error display to match those schemas."
- "The test cases verifying the booking API were written and executed by Sravani."
- "The database schema with 6 tables was Sathwika's design."
- "The Postman collection was prepared by Sravani and the backend team for API testing."

### Common Mistakes to Avoid

- ❌ Don't say "I used Redux" — this project uses React Context only
- ❌ Don't say tokens are stored in cookies — they're in localStorage
- ❌ Don't say "I used CSS files" — all styles are inline JS objects
- ❌ Don't say "React 17" — it's React 18
- ❌ Don't confuse `useEffect` and `useState` when explaining components
- ❌ Don't say the proxy is port 5000 — it points to 5001 (the api/ backend)
- ✅ If asked about something you're unsure of, say "that was handled on the backend by Sathwika" or "I can check the code" — don't guess

### Key Technical Terms to Understand

| Term | Definition in This Project |
|------|---------------------------|
| SPA | Single Page Application — React loads once, routes client-side |
| JWT | JSON Web Token — compact, signed credential sent in Authorization header |
| Bearer token | `Authorization: Bearer <token>` header format |
| Interceptor | Axios middleware that runs on every request or response |
| Token refresh | Getting a new access token using the refresh token |
| Protected route | A route component that redirects unauthenticated users |
| Context | React mechanism for global state without prop drilling |
| Hot reload | CRA dev server automatically updates browser on file save |
| Proxy | CRA forwards `/api/*` requests to the backend server |
| Soft delete | Record marked deleted (is_deleted=true) but not removed |

---

## 5.2 Backend Developer — Sathwika

### Must Know Before Presentation

| Topic | Key Detail |
|-------|-----------|
| JWT config | Access: 15m, HS256, JWT_ACCESS_SECRET. Refresh: 7d, JWT_REFRESH_SECRET |
| bcrypt config | 12 rounds, bcryptjs library |
| Database | PostgreSQL via pg, Aiven cloud, SSL, pool max 10 |
| All 15 endpoints | Method, path, auth requirement, what each does |
| 6 table names | users, refresh_tokens, slots, bookings, booking_events, audit_logs |
| Middleware order | helmet → cors → trust proxy → rate-limit → json → urlencoded → audit |
| Booking transaction | 3 steps: INSERT booking, UPDATE slot, INSERT event |
| Status transitions | pending→confirmed|cancelled, confirmed→completed|cancelled |
| Booking ref format | EBC + base36 timestamp slice + random suffix |
| UUID generation | `gen_random_uuid()` PostgreSQL function |
| Soft delete | is_deleted=TRUE + deleted_at=NOW() |
| Swagger URL | http://localhost:5001/api/docs |

### Can Safely Attribute to Another Team Member

- "The Axios integration layer connecting these APIs to the React frontend was built by Jaya Vardhan."
- "The UI that displays booking results and handles the 3-step booking flow was implemented by Jaya Vardhan."
- "All 35 test cases were documented and executed by Sravani."
- "The E2E testing that caught the num_players integration bug was done by Sravani during testing."
- "The frontend error display for validation messages was Jaya Vardhan's work."

### Common Mistakes to Avoid

- ❌ Don't say bcrypt uses 10 rounds — this project uses 12
- ❌ Don't say the database is MySQL — it's PostgreSQL
- ❌ Don't say the API runs on port 3000 — it's port 5001
- ❌ Don't say JWT uses RS256 — it uses HS256 (HMAC-SHA256)
- ❌ Don't confuse the `authenticate` and `authorize` middleware — they do different things
- ❌ Don't say refresh tokens are stored in plaintext — they're stored as SHA-256 hashes
- ✅ If asked about frontend implementation details, say "Jaya Vardhan implemented that on the React side"

### Key Technical Terms to Understand

| Term | Definition in This Project |
|------|---------------------------|
| REST API | Stateless HTTP interface with standard methods (GET/POST/PUT/DELETE) |
| JWT | JSON Web Token — three base64 parts: header.payload.signature |
| HS256 | HMAC-SHA256 — symmetric signing algorithm (same secret for sign/verify) |
| bcryptjs | Adaptive hashing: password + salt + N rounds → irreversible hash |
| Joi | Declarative schema validation library for request inputs |
| RBAC | Role-Based Access Control — `role` field gates endpoint access |
| Soft delete | is_deleted flag instead of DELETE statement |
| UUID | Universally Unique Identifier — 128-bit, non-guessable primary key |
| Connection pool | Pre-opened DB connections reused across requests |
| Transaction | Atomic set of DB operations — all succeed or all roll back |
| Parameterised query | SQL with `$1` placeholders — prevents SQL injection |
| Rate limiting | Throttle requests per IP — 100 req/15min on /api/* |
| Swagger/OpenAPI | Standard API documentation format with interactive UI |

---

## 5.3 Tester / QA Engineer — Sravani

### Must Know Before Presentation

| Topic | Key Detail |
|-------|-----------|
| Total test cases | 35 across 10 categories |
| Test categories | Auth, JWT & Refresh Token, User Profile, Slots, Booking, Admin Booking Mgmt, Slots Admin, Frontend E2E, Security, Integration |
| Testing tool | Postman for API testing, browser for E2E |
| Auth test range | TC-01 – TC-06 (register, login, validation, duplicates) |
| JWT & refresh range | TC-07 – TC-10 (no token, valid token, refresh, revoked refresh) |
| Booking test range | TC-16 – TC-20 (create, missing field, double-book, invalid slot, past date) |
| Security tests | TC-33: SQL injection (GET /slots), TC-34: empty POST body |
| Key bugs found | num_players missing from booking creation — found in TC-30 (E2E) |
| Double-booking test | TC-18: POST same slot_id twice → 409 |
| Status transition test | TC-23: completed → pending attempt → 400 |
| Postman collection | EagleBox.postman_collection.json in api/ |
| Auth in Postman | Login first (TC-05), copy accessToken, set as Bearer header |
| All test results | PASS (35/35) |

### Can Safely Attribute to Another Team Member

- "The Joi validation schemas that produce the error messages I tested were written by Sathwika."
- "The booking status transition logic that I verified (valid/invalid transitions) was implemented by Sathwika in the booking service."
- "The frontend booking form that I tested end-to-end was built by Jaya Vardhan."
- "The Swagger documentation I used as reference for API testing was set up by Sathwika."
- "The database design with 6 tables that the tests exercise was Sathwika's design."

### Common Mistakes to Avoid

- ❌ Don't say "I wrote unit tests in Jest" — testing was done with Postman and manual E2E
- ❌ Don't say "all features were tested automatically" — all 35 tests are manual
- ❌ Don't confuse "test case" (documented scenario) with "test run" (executing it)
- ❌ Don't claim to have tested Phase 2 features — tournament registration, admin dashboard UI, FAQ, revenue reports, and membership are not part of Phase 1 and were not tested
- ❌ Don't say there were 0 failures — the num_players bug was a real failure found during integration testing, which is a success of the testing process
- ✅ "I found a bug" is a positive thing — testers are supposed to find bugs

### Key Technical Terms to Understand

| Term | Definition in This Project |
|------|---------------------------|
| Test case | Documented scenario: input, expected output, actual output, pass/fail |
| Positive test | Valid input → correct successful output |
| Negative test | Invalid input → correct error response |
| E2E test | Full user journey through browser → frontend → API → database |
| API test | Direct HTTP requests to backend endpoints, bypassing frontend |
| Postman | Tool to send HTTP requests and inspect responses |
| Status code | HTTP numeric code: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorised, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 500 Server Error |
| Bearer token | JWT attached in Authorization header for authenticated requests |
| SQL injection | Attack using SQL syntax in input fields to manipulate DB queries |
| Double-booking | Attempting to book a slot that is already booked |
| Regression | Re-running existing tests after a change to catch new breakages |
| Integration test | Testing frontend + backend together as a combined system |

---

# QUICK REFERENCE CHEAT SHEET

---

## API Endpoints at a Glance

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /api/v1/auth/register | — | — |
| POST | /api/v1/auth/login | — | — |
| POST | /api/v1/auth/refresh | — | — |
| POST | /api/v1/auth/logout | ✅ | any |
| GET | /api/v1/auth/me | ✅ | any |
| PATCH | /api/v1/auth/me | ✅ | any |
| GET | /api/v1/slots | — | — |
| POST | /api/v1/slots | ✅ | admin |
| PUT | /api/v1/slots/:id | ✅ | admin |
| DELETE | /api/v1/slots/:id | ✅ | admin |
| POST | /api/v1/bookings | ✅ | customer/admin |
| GET | /api/v1/bookings/mine | ✅ | customer |
| GET | /api/v1/bookings | ✅ | admin |
| PUT | /api/v1/bookings/:id/status | ✅ | admin |
| GET | /health | — | — |

**Total: 15 endpoints**

---

## Key Numbers to Remember

| Fact | Value |
|------|-------|
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days |
| bcrypt rounds | 12 |
| DB connection pool max | 10 |
| Rate limit | 100 req / 15 min |
| Joi body size limit | 10 KB |
| Max players per booking | 22 |
| Min players per booking | 1 |
| Seed slots created | 48 (8 days × 6 slots) |
| Slot price | ₹600 |
| Total DB tables | 6 |
| Total API endpoints | 15 |
| Total frontend pages | 8 |
| Total test cases | 35 |
| Token storage keys | ebc_access_token, ebc_refresh_token |
| Frontend port | 3000 |
| Backend port | 5001 |

---

## Booking Status Flow

```
           ┌──────────────┐
           │   PENDING    │
           └──────┬───────┘
         ┌────────┴────────┐
         ▼                 ▼
   ┌──────────┐      ┌───────────┐
   │CONFIRMED │      │ CANCELLED │ (terminal)
   └────┬─────┘      └───────────┘
     ┌──┴──┐
     ▼     ▼
┌─────────┐ ┌───────────┐
│COMPLETED│ │ CANCELLED │ (terminal)
│(terminal)│ └───────────┘
└─────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 18.2 |
| Frontend routing | React Router | v6.15 |
| HTTP client | Axios | 1.5 |
| Build tool | react-scripts (CRA) | 5.0.1 |
| Backend framework | Express | 4.18 |
| Runtime | Node.js | — |
| Database | PostgreSQL (Aiven) | — |
| DB driver | pg | 8.11 |
| Auth | jsonwebtoken | 9.0.2 |
| Password hashing | bcryptjs | 2.4.3 |
| Validation | Joi | 17.13.1 |
| Security headers | helmet | 7.1 |
| Rate limiting | express-rate-limit | 7.3 |
| API docs | swagger-jsdoc + swagger-ui-express | — |

---

*End of Eagle Box Cricket — Role-Based Viva Preparation Guide*
*Generated: June 2026 | Based on actual project implementation*
