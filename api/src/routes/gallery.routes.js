const router  = require('express').Router({ mergeParams: true });
const ctrl    = require('../controllers/gallery.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/',         authenticate, ctrl.getPhotos);
router.post('/',        authenticate, ctrl.addPhoto);
router.delete('/:photoId', authenticate, ctrl.deletePhoto);

module.exports = router;
