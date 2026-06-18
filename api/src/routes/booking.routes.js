const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/booking.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize }    = require('../middleware/rbac.middleware');
const { validate }     = require('../middleware/validate.middleware');

const createSchema = Joi.object({
  slot_id:     Joi.string().uuid().required(),
  num_players: Joi.number().integer().min(1).max(22).required(),
  notes:       Joi.string().max(500).optional().allow(''),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled', 'completed').required(),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
  page:   Joi.number().integer().min(1),
  limit:  Joi.number().integer().min(1).max(100),
});

const adminQuerySchema = listQuerySchema.keys({
  search: Joi.string().max(100),
});

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Slot booking management
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking (Customer)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slot_id, num_players]
 *             properties:
 *               slot_id:     { type: string, format: uuid, example: "uuid-of-slot" }
 *               num_players: { type: integer, example: 10 }
 *               notes:       { type: string, example: "Birthday match" }
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Booking created successfully
 *               booking:
 *                 id: "uuid"
 *                 booking_ref: "EBCX7K2M9A"
 *                 status: "pending"
 *                 total_amount: "600.00"
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Slot already booked
 */
router.post('/', authenticate, authorize('customer', 'admin'), validate(createSchema), ctrl.createBooking);

/**
 * @swagger
 * /bookings/mine:
 *   get:
 *     summary: Get current customer's bookings (paginated)
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated booking list
 */
router.get('/mine', authenticate, validate(listQuerySchema, 'query'), ctrl.getMyBookings);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin only, with search and pagination)
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by customer name, phone, or booking ref
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated booking list
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticate, authorize('admin'), validate(adminQuerySchema, 'query'), ctrl.getAllBookings);

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status (Admin only)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [confirmed, cancelled, completed] }
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Booking not found
 */
router.put('/:id/status', authenticate, authorize('admin'), validate(statusSchema), ctrl.updateBookingStatus);

module.exports = router;
