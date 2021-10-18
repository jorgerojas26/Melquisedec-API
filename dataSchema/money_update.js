const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null),
    payment_method_id: Joi.number().required(),
    amount: Joi.number().required(),
    currency: Joi.string().required(),
    reasons: Joi.string().required(),
});

module.exports = schema;
