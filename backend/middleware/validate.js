const _ = require('lodash');
const { ApiError } = require('./ApiError');

const validate = (schema) => (req, res, next) => {
  console.log(schema);
  validateRequestData(req.body, schema.body, next);
  validateRequestData(req.params, schema.params, next);
  validateRequestData(req.query, schema.query, next);
  next();
};

const validateRequestData = (validationSchema, requestData, next) => {
  if (requestData) {
    const { error } = requestData.validate(validationSchema, {
      abortEarly: false,
    });
    if (error) {
      const errorMessage =_.map(error.details,(detail)=>{
        return detail.message
      }).join(', ')
      throw new ApiError(400, errorMessage);
    }
  }
};

module.exports = { validate };