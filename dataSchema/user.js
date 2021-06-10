const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    username: Joi.string().required().messages({
        'string.empty': 'El campo username es requerido',
    }),
    password: Joi.string().allow(null).required().min(4).max(20).messages({
        'string.min': 'La contraseña debe tener como mínimo 4 caracteres',
        'string.max': 'La contraseña debe tener como máximo 20 caracteres',
        'string.empty': 'El campo contraseña es requerido',
    }),
    permissions: Joi.number().required().min(1).max(4).messages({
        'number.min': 'El valor del campo permiso es inválido',
        'number.max': 'El valor del campo permiso es inválido',
    }),
    createdAt: Joi.date().allow(''),
});

module.exports = schema;
