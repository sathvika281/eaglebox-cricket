const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate entry — resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced resource does not exist' });
  }

  const statusCode = err.statusCode || 500;
  const message    = err.expose ? err.message : 'Internal server error';

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
