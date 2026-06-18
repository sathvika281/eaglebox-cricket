const { forbidden } = require('../utils/response.utils');

/**
 * authorize('admin') — only admins
 * authorize('admin', 'customer') — either role
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return forbidden(res);
  if (!roles.includes(req.user.role)) {
    return forbidden(res, `Role '${req.user.role}' is not permitted for this action`);
  }
  next();
};

module.exports = { authorize };
