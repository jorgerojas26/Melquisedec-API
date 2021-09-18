const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    currency: Joi.string().required().min(1).max(20).messages({
        'string.empty': 'El campo currency es requerido',
        'string.min': 'El campo moneda debe contener mínimo 3 caracteres',
        'string.max': 'El campo moneda debe contener máximo 3 caracteres',
    }),
    value: Joi.number().required().min(0).messages({
        'number.empty': 'El campo valor es requerido',
    }),
    rounding: Joi.number().required().messages({
        'number.empty': 'El campo redondeo es requerido',
    }),
});

module.exports = schema;
