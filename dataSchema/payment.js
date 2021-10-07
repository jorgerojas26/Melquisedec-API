const Joi = require('Joi');

const schema = Joi.object().keys({
    saleId: Joi.number().required().messages({ 'number.empty': 'Debe proveer el ID de la venta' }),
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
});

module.exports = schema;
