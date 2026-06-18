const SlotService = require('../services/slot.service');
const R = require('../utils/response.utils');

const getSlots = async (req, res, next) => {
  try {
    const result = await SlotService.getSlots(req.query);
    return R.success(res, result);
  } catch (err) { next(err); }
};

const createSlot = async (req, res, next) => {
  try {
    const slot = await SlotService.createSlot(req.body, req.user.id, req);
    return R.created(res, { slot }, 'Slot created');
  } catch (err) { next(err); }
};

const updateSlot = async (req, res, next) => {
  try {
    const slot = await SlotService.updateSlot(req.params.id, req.body, req.user.id, req);
    return R.success(res, { slot }, 'Slot updated');
  } catch (err) { next(err); }
};

const deleteSlot = async (req, res, next) => {
  try {
    await SlotService.deleteSlot(req.params.id, req.user.id, req);
    return R.success(res, {}, 'Slot deleted');
  } catch (err) { next(err); }
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot };
