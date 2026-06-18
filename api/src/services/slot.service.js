const SlotModel  = require('../models/slot.model');
const AuditModel = require('../models/audit.model');
const { paginate, paginatedResponse } = require('../utils/pagination.utils');

const getSlots = async (queryParams) => {
  const { page, limit, offset } = paginate(queryParams);
  const { date, status } = queryParams;
  const { data, total } = await SlotModel.findAll({ date, status, page, limit });
  return paginatedResponse(data, total, page, limit);
};

const createSlot = async ({ slot_date, start_time, end_time, price }, adminId, req) => {
  const today = new Date().toISOString().split('T')[0];
  if (slot_date < today) {
    throw Object.assign(new Error('Cannot create slots in the past'), { statusCode: 400, expose: true });
  }

  const overlap = await SlotModel.checkOverlap(slot_date, start_time, end_time);
  if (overlap) {
    throw Object.assign(new Error('A slot already exists for this time range'), { statusCode: 409, expose: true });
  }

  const slot = await SlotModel.create({ slot_date, start_time, end_time, price, created_by: adminId });

  await AuditModel.log({
    userId: adminId, action: 'SLOT_CREATED',
    entityType: 'slots', entityId: slot.id,
    newValues: { slot_date, start_time, end_time, price },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  return slot;
};

const updateSlot = async (id, fields, adminId, req) => {
  const existing = await SlotModel.findById(id);
  if (!existing) throw Object.assign(new Error('Slot not found'), { statusCode: 404, expose: true });

  if (existing.status === 'booked') {
    throw Object.assign(new Error('Cannot edit a booked slot'), { statusCode: 400, expose: true });
  }

  const newDate      = fields.slot_date  || existing.slot_date;
  const newStartTime = fields.start_time || existing.start_time;
  const newEndTime   = fields.end_time   || existing.end_time;

  if (fields.start_time || fields.end_time || fields.slot_date) {
    const overlap = await SlotModel.checkOverlap(newDate, newStartTime, newEndTime, id);
    if (overlap) {
      throw Object.assign(new Error('Updated time overlaps with another slot'), { statusCode: 409, expose: true });
    }
  }

  const updated = await SlotModel.update(id, fields);

  await AuditModel.log({
    userId: adminId, action: 'SLOT_UPDATED',
    entityType: 'slots', entityId: id,
    oldValues: existing, newValues: fields,
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });

  return updated;
};

const deleteSlot = async (id, adminId, req) => {
  const existing = await SlotModel.findById(id);
  if (!existing) throw Object.assign(new Error('Slot not found'), { statusCode: 404, expose: true });

  const hasBookings = await SlotModel.hasActiveBookings(id);
  if (hasBookings) {
    throw Object.assign(new Error('Cannot delete a slot with active bookings'), { statusCode: 400, expose: true });
  }

  await SlotModel.softDelete(id);

  await AuditModel.log({
    userId: adminId, action: 'SLOT_DELETED',
    entityType: 'slots', entityId: id,
    oldValues: { slot_date: existing.slot_date, start_time: existing.start_time },
    ip: req?.ip, userAgent: req?.headers?.['user-agent'],
  });
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };
