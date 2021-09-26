const Joi = require('joi');

const schema = Joi.object().keys({
    id: Joi.number().allow(null).allow(''),
    name: Joi.string().required().messages({
        'string.empty': 'El campo nombre es requerido',
    }),
    createdAt: Joi.date().allow(''),
});

module.exports = schema;
