const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    name: Joi.string().required().messages({
        'string.empty': 'El campo nombre es requerido',
    }),
    cedula: Joi.string().required().min(7).max(8).messages({
        'string.empty': 'El campo cédula es requerido',
        'string.min': 'Cédula inválida',
        'string.max': 'Cédula inválida',
    }),
    phoneNumber: Joi.string().allow('').min(11).max(11).messages({
        'string.min': 'Número de teléfono inválido. Debe contener 11 caracteres.',
        'string.max': 'Número de teléfono inválido. Debe contener 11 caracteres.',
    }),
    createdAt: Joi.date().allow(''),
});

module.exports = schema;
