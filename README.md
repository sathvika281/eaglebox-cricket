# Box Cricket Slot Booking System

**Company:** Eagle Box Cricket | **Location:** Hyderabad, India
**Internship Duration:** 01 June 2026 – 30 June 2026 (26 Working Days)

---

## Problem Statement

Eagle Box Cricket currently manages all slot bookings manually through WhatsApp and phone calls, leading to double bookings, missed confirmations, and revenue loss. This project builds a digital slot booking system where customers can check real-time availability, book slots online, and receive instant confirmation.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React.js + Tailwind CSS | Slot booking UI, FAQ chat, admin dashboard |
| Backend | Node.js + Express.js | REST APIs, booking logic, validation |
| Database | MySQL (Aiven.io) | Slots, bookings, payments, memberships |
| Deployment | Vercel + Render | Frontend on Vercel, Backend on Render |
| Version Control | GitHub | Code collaboration and deployment |

---

## Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| Y. Jaya Vardhan | Frontend Developer | React pages, slot booking UI, admin dashboard, FAQ chat |
| T. Sathwika | Backend Developer | Node.js APIs, MySQL schema, booking logic, deployment |
| V. Shravani | Testing & Deployment | GitHub management, Postman testing, deployment validation |

---

## Project Structure

```
box-cricket-slot-booking/
├── frontend/        → React.js app (UI, components, pages)
├── backend/         → Node.js Express server (APIs, DB)
├── docs/            → Wireframes, ER diagram, architecture
├── tests/           → Test cases, Postman collections
└── README.md
```

---

## Key Features

- Real-time slot availability check
- Online slot booking with instant Booking ID
- Customer portal — My Bookings page (track by phone number)
- Admin dashboard — manage bookings, confirm/cancel, revenue reports
- Tournament registration and membership management
- Chat-style FAQ assistant

---

## Review Milestones

| Review | Date | What to Present |
|--------|------|----------------|
| Review 1 | 06 June 2026 | Company intro, problem statement, objectives, abstract, wireframes |
| Review 2 | 19–20 June 2026 | Literature survey, architecture, DB design, initial working code |
| Review 3 | 29–30 June 2026 | Full working prototype, report, PPT, GitHub, demo video |

---

## Database Design (12 Tables)

1. users — customer accounts
2. admins — venue admin accounts
3. slots — available time slots
4. bookings — slot booking records
5. payments — payment tracking
6. tournaments — tournament events
7. tournament_registrations — team registrations
8. memberships — membership plans
9. membership_subscriptions — customer subscriptions
10. players — player profiles
11. occupancy — venue occupancy tracking
12. feedback — customer feedback

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/slots | Get available slots by date |
| POST | /api/bookings | Create a new booking |
| GET | /api/bookings/:phone | Get bookings by phone number |
| PUT | /api/bookings/:id/status | Update booking status (admin) |
| GET | /api/dashboard | Admin dashboard summary |
| POST | /api/tournaments | Register for tournament |
| POST | /api/memberships | Subscribe to membership |

---

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env
# fill in your DB credentials in .env
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Deployment

- **Frontend:** Vercel — [link TBD]
- **Backend:** Render — [link TBD]
- **Database:** MySQL on Aiven.io — [configured via .env]
