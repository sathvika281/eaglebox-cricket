const { badRequest } = require('../utils/response.utils');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map((d) => d.message.replace(/"/g, "'"));
    return badRequest(res, 'Validation failed', messages);
  }
  next();
};

module.exports = { validate };
