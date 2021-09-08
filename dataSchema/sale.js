const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    clientId: Joi.number().allow(null),
    products: Joi.array().items(
        Joi.object().keys({
            id: Joi.number().required(),
            quantity: Joi.number().required(),
        })
    ),
    status: Joi.number().allow(null),
});

module.exports = schema;
