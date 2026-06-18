const success = (res, data = {}, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

const created = (res, data = {}, message = 'Created') =>
  success(res, data, message, 201);

const error = (res, message = 'Internal server error', statusCode = 500, errors = []) =>
  res.status(statusCode).json({ success: false, message, ...(errors.length && { errors }) });

const notFound = (res, message = 'Resource not found') =>
  error(res, message, 404);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, message, 401);

const forbidden = (res, message = 'Forbidden') =>
  error(res, message, 403);

const badRequest = (res, message = 'Bad request', errors = []) =>
  error(res, message, 400, errors);

module.exports = { success, created, error, notFound, unauthorized, forbidden, badRequest };
