const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    name: Joi.string().required().messages({
        'string.empty': 'El campo nombre es requerido',
    }),
    rif: Joi.string().required().messages({
        'string.empty': 'El campo rif es requerido',
    }),
    address: Joi.string().required().messages({
        'string.empty': 'El campo dirección es requerido',
    }),
    phoneNumber: Joi.string().required().min(11).max(11).messages({
        'string.empty': 'El campo teléfono es requerido',
        'string.min': 'Número de teléfono inválido. Debe contener 11 caracteres.',
        'string.max': 'Número de teléfono inválido. Debe contener 11 caracteres.',
    }),
    createdAt: Joi.date().allow(''),
});

module.exports = schema;
