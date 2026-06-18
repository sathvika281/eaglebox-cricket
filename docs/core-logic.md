# Core Logic Document
## Box Cricket Slot Booking System — Day 13

## 1. Booking Workflow (Rule-Based Logic)

### Step-by-Step Flow
```
Customer Request
      │
      ▼
[VALIDATE INPUT]
  - customer_name required?  → NO  → 400 Bad Request
  - phone 10 digits?         → NO  → 400 Bad Request
  - slot_id provided?        → NO  → 400 Bad Request
      │
      ▼ (all valid)
[CHECK SLOT AVAILABILITY]
  - SELECT slot WHERE id = slot_id
  - slot.status = 'available'?  → NO  → 409 Conflict "Slot already booked"
      │
      ▼ (slot available)
[ATOMIC TRANSACTION]
  - START TRANSACTION
  - INSERT INTO bookings (status = 'pending')
  - UPDATE slots SET status = 'booked'
  - COMMIT
  - Log to action_history: BOOKING_CREATED
      │
      ▼
[RETURN BOOKING ID]
  - booking_id = 'EBC' + Date.now()
  - Return to customer
```

## 2. Status Update Workflow (Admin)

```
Admin Action: Confirm / Cancel
      │
      ▼
[VALIDATE STATUS]
  - allowed: ['pending', 'confirmed', 'cancelled']
      │
      ▼
[UPDATE BOOKING]
  - UPDATE bookings SET status = ?
      │
  If CANCELLED:
    - UPDATE slots SET status = 'available'  ← slot freed back
  If CONFIRMED:
    - UPDATE slots SET status = 'booked'     ← slot locked
      │
      ▼
[AUDIT LOG]
  - INSERT action_history: STATUS_CONFIRMED / STATUS_CANCELLED
```

## 3. FAQ Rule-Based Engine

The FAQ engine uses keyword matching to return answers without AI:

| Keywords Detected | Response |
|------------------|----------|
| price, cost, fee | ₹500 per slot (1.5 hours) |
| cancel | Contact admin with Booking ID |
| time, slot, available | 9AM–9PM, 1.5 hour slots |
| player, team, member | 6–22 players per booking |
| tournament | Register via Tournaments section |
| membership | Monthly/annual plans available |
| confirm | Admin confirms within 2 hours |
| booking id | EBC + timestamp format |
| (default) | Contact Eagle Box Cricket directly |

## 4. Alert System Logic

Alerts are generated when:
- Booking status = 'pending' AND created_at is more than 2 hours ago
- These are flagged as URGENT in the admin dashboard

```sql
SELECT *, TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_waiting
FROM bookings
WHERE status = 'pending'
ORDER BY created_at ASC
```

- `minutes_waiting > 120` → URGENT (red badge)
- `minutes_waiting < 120` → Normal pending (yellow)

## 5. Slot Blocking Rules

| Action | Condition | Result |
|--------|-----------|--------|
| Book slot | status = 'available' | status → 'booked' |
| Cancel booking | status = 'confirmed'/'pending' | slot status → 'available' |
| Admin block | status = 'available' | status → 'blocked' |
| Admin delete | status != 'booked' | Slot removed |

## 6. Tournament Registration Logic

```
Team registers for tournament
      │
      ▼
[CHECK TOURNAMENT STATUS]
  - Not 'completed'? → OK
  - Teams registered < max_teams? → OK
      │
      ▼
[INSERT REGISTRATION]
  - tournament_registrations table
  - status = 'registered'
```

## 7. Validation Rules (All Endpoints)

| Field | Rule |
|-------|------|
| phone | Must be exactly 10 digits |
| customer_name | Required, non-empty string |
| slot_id | Must exist in slots table |
| slot_date | Must be a valid date (YYYY-MM-DD) |
| status | Must be one of: pending/confirmed/cancelled |
| num_players | Integer between 1 and 22 |
