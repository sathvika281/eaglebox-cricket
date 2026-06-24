const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/match.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate }     = require('../middleware/validate.middleware');

const scheduleSchema = Joi.object({
  team_a_id:     Joi.string().required(),
  team_b_id:     Joi.string().allow('', null).optional(),
  opponent_name: Joi.string().allow('', null).optional(),
  match_date:    Joi.string().required(),
  match_time:    Joi.string().required(),
  venue_note:    Joi.string().allow('', null).optional(),
  slot_id:       Joi.string().allow('', null).optional(),
  booking_id:    Joi.string().allow('', null).optional(),
});

const updateSchema = Joi.object({
  match_date:     Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  match_time:     Joi.string().pattern(/^\d{2}:\d{2}$/),
  venue_note:     Joi.string().max(255),
  status:         Joi.string().valid('scheduled', 'completed', 'cancelled'),
  result:         Joi.string().max(500),
  winner_team_id: Joi.string().uuid(),
}).min(1);

router.get('/',       authenticate, ctrl.getMyMatches);
router.post('/',      authenticate, validate(scheduleSchema), ctrl.scheduleMatch);
router.get('/:id',    authenticate, ctrl.getMatch);
router.put('/:id',    authenticate, validate(updateSchema), ctrl.updateMatch);
router.put('/:id/cancel', authenticate, ctrl.cancelMatch);

module.exports = router;
