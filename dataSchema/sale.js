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
                    id: Joi.number().required(),
                    payment_method_id: Joi.number().required(),
                    name: Joi.string().required(),
                    amount: Joi.number().required(),
                    currency: Joi.string().required(),
                    isChange: Joi.boolean().required(),
                }),
                Joi.object().keys({
                    id: Joi.number().required(),
                    payment_method_id: Joi.number().required(),
                    name: Joi.string().required(),
                    amount: Joi.number().required(),
                    isChange: Joi.boolean().required(),
                    currency: Joi.string().required(),
                }),
                Joi.object().keys({
                    id: Joi.number().required(),
                    payment_method_id: Joi.number().required(),
                    name: Joi.string().required(),
                    amount: Joi.number().required(),
                    currency: Joi.string().required(),
                    bankId: Joi.number().required(),
                    transaction_code: Joi.string().required(),
                    isChange: Joi.boolean().required(),
                })
            )
        )
        .required()
        .messages({ 'alternatives.match': 'La información de pago es incorrecta' }),
    status: Joi.number().allow(null),
    saveAsDebt: Joi.boolean().required(),
    paying_debts: Joi.array().items(Joi.number()).allow(null),
});

module.exports = schema;
