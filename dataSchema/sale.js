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
    paymentInfo: Joi.array()
        .items(
            Joi.alternatives().try(
                Joi.object().keys({
                    id: Joi.number().disallow(null).required(),
                    name: Joi.string().disallow(null).required(),
                    amount: Joi.number().disallow(null).required(),
                    isChange: Joi.boolean().disallow(null).required(),
                }),
                Joi.object().keys({
                    id: Joi.number().disallow(null).required(),
                    name: Joi.string().disallow(null).required(),
                    amount: Joi.number().disallow(null).required(),
                    isChange: Joi.boolean().disallow(null).required(),
                    currency: Joi.string().disallow(null).required(),
                }),
                Joi.object().keys({
                    id: Joi.number().disallow(null).required(),
                    name: Joi.string().disallow(null).required(),
                    amount: Joi.number().disallow(null).required(),
                    bankId: Joi.number().disallow(null).required(),
                    code: Joi.number().disallow(null).required(),
                    isChange: Joi.boolean().disallow(null).required(),
                })
            )
        )
        .required()
        .messages({ 'alternatives.match': 'La información de pago es incorrecta' }),
    status: Joi.number().allow(null),
    saveAsDebt: Joi.boolean().required(),
});

module.exports = schema;
