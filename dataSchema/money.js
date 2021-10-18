const Joi = require('joi');

const schema = Joi.object().keys({
    payment_method_id: Joi.number().required(),
    amount: Joi.number().required(),
    currency: Joi.string().required(),
});

module.exports = schema;
