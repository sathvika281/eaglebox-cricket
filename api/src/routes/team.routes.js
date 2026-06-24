const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/team.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate }     = require('../middleware/validate.middleware');

const createSchema = Joi.object({
  team_name:     Joi.string().min(2).max(100).required(),
  description:   Joi.string().max(500).allow('').optional(),
  logo_url:      Joi.string().uri().max(500).allow('').optional(),
  captain_name:  Joi.string().max(100).allow('').optional(),
  captain_phone: Joi.string().max(15).allow('').optional(),
  captain_email: Joi.string().email().allow('').optional(),
});

const memberSchema = Joi.object({
  player_name:   Joi.string().min(2).max(100).required(),
  player_phone:  Joi.string().max(15).allow('').optional(),
  player_email:  Joi.string().email().allow('').optional(),
  role:          Joi.string().valid('player', 'vice_captain').optional(),
  jersey_number: Joi.number().integer().min(1).max(99).optional(),
  user_id:       Joi.string().uuid().optional(),
});

router.get('/',                       authenticate, ctrl.getMyTeams);
router.post('/',                      authenticate, validate(createSchema), ctrl.createTeam);
router.get('/:id',                    authenticate, ctrl.getTeam);
router.put('/:id',                    authenticate, ctrl.updateTeam);
router.delete('/:id',                 authenticate, ctrl.deleteTeam);
router.post('/:id/members',           authenticate, validate(memberSchema), ctrl.addMember);
router.delete('/:id/members/:memberId', authenticate, ctrl.removeMember);
router.put('/:id/members/:memberId/captain', authenticate, ctrl.assignCaptain);

module.exports = router;
