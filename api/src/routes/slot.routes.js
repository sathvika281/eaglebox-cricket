const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/slot.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { authorize }     = require('../middleware/rbac.middleware');
const { validate }      = require('../middleware/validate.middleware');

const createSchema = Joi.object({
  slot_date:  Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({ 'string.pattern.base': 'slot_date must be YYYY-MM-DD' }),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({ 'string.pattern.base': 'start_time must be HH:MM' }),
  end_time:   Joi.string().pattern(/^\d{2}:\d{2}$/).required().messages({ 'string.pattern.base': 'end_time must be HH:MM' }),
  price:      Joi.number().positive().required(),
});

const updateSchema = Joi.object({
  slot_date:  Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/),
  end_time:   Joi.string().pattern(/^\d{2}:\d{2}$/),
  price:      Joi.number().positive(),
  status:     Joi.string().valid('available', 'blocked'),
}).min(1);

const querySchema = Joi.object({
  date:   Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  status: Joi.string().valid('available', 'booked', 'blocked'),
  page:   Joi.number().integer().min(1),
  limit:  Joi.number().integer().min(1).max(100),
});

/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Cricket slot management
 */

/**
 * @swagger
 * /slots:
 *   get:
 *     summary: Get all slots (paginated, filterable by date and status)
 *     tags: [Slots]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema: { type: string, example: "2026-06-20" }
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, booked, blocked] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of slots
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Success
 *               data:
 *                 - id: "uuid"
 *                   slot_date: "2026-06-20"
 *                   start_time: "06:00:00"
 *                   end_time: "07:30:00"
 *                   price: "600.00"
 *                   status: "available"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 6
 *                 totalPages: 1
 */
router.get('/', validate(querySchema, 'query'), ctrl.getSlots);

/**
 * @swagger
 * /slots:
 *   post:
 *     summary: Create a new slot (Admin only)
 *     tags: [Slots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slot_date, start_time, end_time, price]
 *             properties:
 *               slot_date:  { type: string, example: "2026-06-25" }
 *               start_time: { type: string, example: "06:00" }
 *               end_time:   { type: string, example: "07:30" }
 *               price:      { type: number, example: 600 }
 *     responses:
 *       201:
 *         description: Slot created
 *       400:
 *         description: Past date or validation error
 *       409:
 *         description: Overlapping slot exists
 *       403:
 *         description: Admin access required
 */
router.post('/', authenticate, authorize('admin'), validate(createSchema), ctrl.createSlot);

/**
 * @swagger
 * /slots/{id}:
 *   put:
 *     summary: Update a slot (Admin only)
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slot_date:  { type: string }
 *               start_time: { type: string }
 *               end_time:   { type: string }
 *               price:      { type: number }
 *               status:     { type: string, enum: [available, blocked] }
 *     responses:
 *       200:
 *         description: Slot updated
 *       400:
 *         description: Cannot edit a booked slot
 *       404:
 *         description: Slot not found
 */
router.put('/:id', authenticate, authorize('admin'), validate(updateSchema), ctrl.updateSlot);

/**
 * @swagger
 * /slots/{id}:
 *   delete:
 *     summary: Soft delete a slot (Admin only)
 *     tags: [Slots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Slot deleted
 *       400:
 *         description: Slot has active bookings
 *       404:
 *         description: Slot not found
 */
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteSlot);

module.exports = router;
