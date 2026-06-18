const { query } = require('../config/database');

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const auditLog = async (userId, action, entityType, entityId, oldValues, newValues, req) => {
  try {
    await query(
      `INSERT INTO audit_logs
         (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        userId     || null,
        action,
        entityType || null,
        entityId   || null,
        oldValues  ? JSON.stringify(oldValues)  : null,
        newValues  ? JSON.stringify(newValues)  : null,
        req?.ip    || null,
        req?.headers?.['user-agent'] || null,
      ]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

const auditMiddleware = (req, res, next) => {
  if (!WRITE_METHODS.has(req.method)) return next();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode < 400 && req.user) {
      auditLog(
        req.user.id,
        `${req.method} ${req.path}`,
        null, null, null,
        null,
        req
      );
    }
    return originalJson(body);
  };
  next();
};

module.exports = { auditMiddleware, auditLog };
