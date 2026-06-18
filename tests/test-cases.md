# Test Case Documentation
## Box Cricket Slot Booking System

| Test ID | Feature | Test Description | Input | Expected Output | Status |
|---------|---------|-----------------|-------|-----------------|--------|
| TC-01 | Slots API | Fetch slots for valid date | GET /api/slots?date=2026-06-15 | JSON with available slots array | PASS |
| TC-02 | Slots API | Fetch slots without date | GET /api/slots | 400 error: date required | PASS |
| TC-03 | Slots API | Fetch slots for date with no slots | GET /api/slots?date=2026-01-01 | Empty slots array | PASS |
| TC-04 | Booking | Create booking with valid data | POST /api/bookings {name, phone, slot_id} | booking_id returned, slot marked booked | PASS |
| TC-05 | Booking | Create booking with missing name | POST /api/bookings {phone, slot_id} | 400 error: customer_name required | PASS |
| TC-06 | Booking | Create booking with invalid phone | POST /api/bookings {phone: "123"} | 400 error: phone must be 10 digits | PASS |
| TC-07 | Booking | Book an already booked slot | POST /api/bookings {slot_id: booked_slot} | 409 error: slot not available | PASS |
| TC-08 | Booking | Get bookings by phone | GET /api/bookings/9876543210 | List of bookings for that phone | PASS |
| TC-09 | Booking | Get bookings for unknown phone | GET /api/bookings/0000000000 | Empty bookings array | PASS |
| TC-10 | Admin | Confirm a pending booking | PUT /api/bookings/1/status {status: confirmed} | Status updated to confirmed | PASS |
| TC-11 | Admin | Cancel a booking | PUT /api/bookings/1/status {status: cancelled} | Status cancelled, slot freed | PASS |
| TC-12 | Admin | Invalid status update | PUT /api/bookings/1/status {status: invalid} | 400 error: invalid status | PASS |
| TC-13 | Dashboard | Get admin dashboard stats | GET /api/admin/dashboard | total_bookings, confirmed, pending, cancelled | PASS |
| TC-14 | Reports | Get revenue report | GET /api/reports/revenue | total_revenue, daily breakdown | PASS |
| TC-15 | Reports | Get occupancy report | GET /api/reports/occupancy | Per-date occupancy percentage | PASS |
| TC-16 | Reports | Get alerts | GET /api/reports/alerts | Pending bookings with waiting time | PASS |
| TC-17 | Tournaments | Create tournament | POST /api/tournaments {name, start_date, end_date} | tournament_id returned | PASS |
| TC-18 | Tournaments | Register team | POST /api/tournaments/1/register {team_name, captain_name, phone} | registration_id returned | PASS |
| TC-19 | Tournaments | Register for full tournament | POST /api/tournaments/:id/register (when full) | 400 error: tournament is full | PASS |
| TC-20 | FAQ | Get all FAQs | GET /api/faq | List of Q&A pairs | PASS |
| TC-21 | FAQ | Ask specific question | POST /api/faq/ask {question: "what is price"} | Answer about Rs.500 | PASS |
| TC-22 | Slots Admin | Create single slot | POST /api/slots {slot_date, start_time, end_time} | slot_id returned | PASS |
| TC-23 | Slots Admin | Bulk create slots | POST /api/slots/bulk {slot_date, time_slots[]} | Count of created slots | PASS |
| TC-24 | Slots Admin | Delete available slot | DELETE /api/slots/:id | Slot deleted successfully | PASS |
| TC-25 | Slots Admin | Delete booked slot | DELETE /api/slots/:id (booked) | 400 error: cannot delete booked slot | PASS |
| TC-26 | Frontend | Home page loads | Open localhost:3000 | Eagle Box Cricket homepage visible | PASS |
| TC-27 | Frontend | Book Now navigation | Click Book Now | Navigates to /book | PASS |
| TC-28 | Frontend | Date picker shows slots | Select 2026-06-15 + Check Slots | 4 green slot buttons appear | PASS |
| TC-29 | Frontend | Book a slot end-to-end | Select slot, Fill form, Submit | Booking ID shown on success screen | PASS |
| TC-30 | Frontend | My Bookings search | Enter phone, Search | Booking cards displayed with status | PASS |
| TC-31 | Frontend | Admin dashboard loads | Open /admin | Stats cards + bookings table visible | PASS |
| TC-32 | Frontend | Admin confirm booking | Click Confirm button | Row updates to CONFIRMED (green) | PASS |
| TC-33 | Frontend | Admin cancel booking | Click Cancel button | Row updates to CANCELLED (red) | PASS |
| TC-34 | Frontend | Revenue tab | Click Revenue tab | Daily revenue table shown | PASS |
| TC-35 | Frontend | Alerts tab | Click Alerts tab | Pending bookings list shown | PASS |
| TC-36 | Security | SQL injection attempt | phone = DROP TABLE attempt | Parameterized query blocks it | PASS |
| TC-37 | Security | Empty body POST | POST /api/bookings {} | 400 validation error | PASS |
| TC-38 | Integration | Full booking flow | Book, Check My Bookings, Admin confirms | Status updates visible end-to-end | PASS |

---
**Total Test Cases:** 38
**Passing:** 38
**Failing:** 0
**Last Updated:** June 2026
