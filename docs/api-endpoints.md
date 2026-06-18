# API Endpoints — Box Cricket Slot Booking System

## Base URL
- Local: `http://localhost:5000`
- Production: `https://your-render-app.onrender.com` (TBD)

---

## Slots

### GET /api/slots?date=YYYY-MM-DD
Returns all slots for a given date.

**Request:**
```
GET /api/slots?date=2026-06-15
```

**Response:**
```json
{
  "success": true,
  "date": "2026-06-15",
  "slots": [
    { "id": 1, "slot_date": "2026-06-15", "start_time": "06:00", "end_time": "07:00", "price": 500, "status": "available" },
    { "id": 2, "slot_date": "2026-06-15", "start_time": "07:00", "end_time": "08:00", "price": 500, "status": "booked" }
  ]
}
```

---

## Bookings

### POST /api/bookings
Create a new booking.

**Request Body:**
```json
{
  "customer_name": "Ravi Kumar",
  "phone": "9876543210",
  "email": "ravi@email.com",
  "slot_id": 1,
  "num_players": 6,
  "booking_type": "regular"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking_id": "EBC1718123456789"
}
```

---

### GET /api/bookings/:phone
Get all bookings by customer phone number.

**Response:**
```json
{
  "success": true,
  "phone": "9876543210",
  "bookings": [
    {
      "id": 1,
      "booking_id": "EBC1718123456789",
      "customer_name": "Ravi Kumar",
      "slot_date": "2026-06-15",
      "start_time": "06:00",
      "end_time": "07:00",
      "status": "confirmed"
    }
  ]
}
```

---

### GET /api/bookings?status=pending&date=2026-06-15
Get all bookings (admin). Optional filters: status, date.

---

### PUT /api/bookings/:id/status
Update booking status (admin only).

**Request Body:**
```json
{ "status": "confirmed" }
```
Valid values: `pending`, `confirmed`, `cancelled`

---

## Admin

### GET /api/admin/dashboard
Get summary statistics.

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "total_bookings": 45,
    "confirmed": 30,
    "pending": 10,
    "cancelled": 5,
    "total_slots": 20,
    "available_slots": 12
  }
}
```

---

## Error Responses

| Code | Meaning |
|------|---------|
| 400 | Bad request — missing or invalid fields |
| 404 | Not found |
| 500 | Server error |

```json
{ "error": "customer_name, phone, and slot_id are required" }
```
