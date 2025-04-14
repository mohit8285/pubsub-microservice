// src/utils/validator.js
const Joi = require("joi");

// Validation schema for user data
const userDataSchema = Joi.object({
  user: Joi.string().required(),
  class: Joi.string().required(),
  age: Joi.number().integer().required(),
  email: Joi.string().email().required(),
});

// Validate user data
const validateUserData = (data) => {
  return userDataSchema.validate(data);
};

module.exports = {
  validateUserData,
};
