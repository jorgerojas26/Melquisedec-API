const Joi = require('joi');

const schema = Joi.object().keys({
  id: Joi.number().allow(null).allow(''),
  clientId: Joi.number().allow(null),
});

module.exports = schema;
