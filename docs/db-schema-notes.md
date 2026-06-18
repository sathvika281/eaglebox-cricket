# Database Schema Notes — Box Cricket Slot Booking System

## Total Tables: 12

| # | Table | Purpose |
|---|-------|---------|
| 1 | users | Customer accounts |
| 2 | admins | Venue admin accounts |
| 3 | slots | Available time slots per date |
| 4 | bookings | Slot booking records |
| 5 | payments | Payment tracking per booking |
| 6 | tournaments | Tournament events |
| 7 | tournament_registrations | Team registrations for tournaments |
| 8 | memberships | Membership plan definitions |
| 9 | membership_subscriptions | Customer membership subscriptions |
| 10 | players | Player profiles |
| 11 | occupancy | Daily venue occupancy tracking |
| 12 | feedback | Customer ratings and comments |

## Key Relationships

- bookings → slots (slot_id FK)
- payments → bookings (booking_id FK)
- tournament_registrations → tournaments (tournament_id FK)
- membership_subscriptions → users + memberships (FK both)
- feedback → bookings (booking_id FK)

## Status Values

### Slots
- available — can be booked
- booked — already reserved
- blocked — blocked by admin (maintenance, etc.)

### Bookings
- pending — created, awaiting admin confirmation
- confirmed — admin confirmed
- cancelled — cancelled by customer or admin

### Payments
- pending — payment not yet made
- paid — payment received
- refunded — payment returned after cancellation

## Validation Rules

- phone: must be 10 digits
- slot cannot be double-booked (check status = available before insert)
- booking_id is auto-generated: EBC + timestamp
- rating in feedback: 1–5 only
