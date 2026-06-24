const router = require('express').Router();
const Joi    = require('joi');
const ctrl   = require('../controllers/promo.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize }    = require('../middleware/rbac.middleware');
const { validate }     = require('../middleware/validate.middleware');

const validateSchema = Joi.object({
  code:           Joi.string().required(),
  booking_amount: Joi.number().min(0).required(),
});

router.post('/validate', authenticate, validate(validateSchema), ctrl.validatePromo);
router.get('/',          authenticate, authorize('admin'), ctrl.getAllCodes);
router.post('/',         authenticate, authorize('admin'), ctrl.createCode);

module.exports = router;
