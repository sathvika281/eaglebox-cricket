# System Architecture
## Box Cricket Slot Booking System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                    React.js Frontend                         │
│         (Home | BookSlot | MyBookings | Admin |              │
│          TournamentRegistration)                             │
│                   localhost:3000 / Vercel                    │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP/REST (axios)
                           │  CORS enabled
┌──────────────────────────▼──────────────────────────────────┐
│                      API LAYER                               │
│                  Node.js + Express.js                        │
│                   localhost:5000 / Render                    │
│                                                              │
│  Routes:                                                     │
│  /api/slots        → slots.js                                │
│  /api/bookings     → bookings.js                             │
│  /api/admin        → admin.js                                │
│  /api/reports      → reports.js                              │
│  /api/tournaments  → tournaments.js                          │
│  /api/faq          → faq.js                                  │
│                                                              │
│  Services:                                                   │
│  bookingService.js → Core logic, validation, audit trail     │
└──────────────────────────┬──────────────────────────────────┘
                           │  mysql2 (SSL/TLS)
                           │  Connection Pool (10 connections)
┌──────────────────────────▼──────────────────────────────────┐
│                    DATABASE LAYER                             │
│              MySQL on Aiven.io (Cloud)                       │
│                                                              │
│  Tables: slots, bookings, users, admins, payments,           │
│          tournaments, tournament_registrations,               │
│          memberships, membership_subscriptions,               │
│          players, occupancy, feedback, action_history         │
└─────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### Frontend (React.js)
- **Home.jsx** — Landing page with navigation to all sections
- **BookSlot.jsx** — 3-step slot booking: date → slot → form → Booking ID
- **MyBookings.jsx** — Customer checks bookings by phone number
- **AdminDashboard.jsx** — Full admin panel: stats, alerts, revenue, confirm/cancel
- **TournamentRegistration.jsx** — Register teams for tournaments

### Backend (Node.js + Express.js)
- **server.js** — App entry point, middleware, route registration
- **db.js** — MySQL connection pool with SSL for Aiven cloud
- **routes/slots.js** — Slot CRUD + bulk create + block/unblock
- **routes/bookings.js** — Booking create, list, filter, status update
- **routes/admin.js** — Dashboard stats aggregation
- **routes/reports.js** — Revenue, occupancy, alerts endpoints
- **routes/tournaments.js** — Tournament CRUD + team registration
- **routes/faq.js** — Rule-based FAQ engine
- **services/bookingService.js** — Core booking logic with audit trail

### Database (MySQL on Aiven.io)
- Cloud-hosted, SSL-encrypted connection
- 13 tables covering all business operations
- Foreign key constraints for data integrity
- Connection pooling (10 concurrent connections)

## Data Flow: Customer Books a Slot

```
1. Customer opens localhost:3000/book
2. Picks date → React calls GET /api/slots?date=2026-06-15
3. Backend queries MySQL slots table → returns available slots
4. Customer clicks a slot + fills form → React calls POST /api/bookings
5. bookingService.js validates input, checks slot availability
6. Transaction: INSERT booking + UPDATE slot status = 'booked'
7. Action logged in action_history table
8. Backend returns { booking_id: 'EBC1234567890' }
9. React shows success screen with Booking ID
```

## Security Features
- Parameterized queries (SQL injection prevention)
- Input validation (phone format, required fields)
- CORS configuration
- SSL/TLS database connection
- Transaction-based booking (prevents double booking)

## Deployment
- **Frontend:** Vercel (free tier)
- **Backend:** Render (free tier)
- **Database:** Aiven.io MySQL (free tier)
