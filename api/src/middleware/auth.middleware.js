const { verifyAccess } = require('../utils/jwt.utils');
const { unauthorized }  = require('../utils/response.utils');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Access token required');
  }

  const token = header.split(' ')[1];
  try {
    req.user = verifyAccess(token);
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Access token expired'
      : 'Invalid access token';
    return unauthorized(res, message);
  }
};

module.exports = { authenticate };
