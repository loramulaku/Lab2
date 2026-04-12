/**
 * Request validation middleware factory.
 * Pass a Joi / zod schema (or any object with a validate() method).
 *
 * Usage:
 *   const { createJobSchema } = require('../validators/job.validator');
 *   router.post('/jobs', auth, validate(createJobSchema), jobController.create);
 *
 * @param {object} schema - object with a validate(data) → { error, value } method
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false });
    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(422).json({ message: 'Validation failed', errors: messages });
    }
    req[source] = value;
    next();
  };
}

module.exports = validate;
