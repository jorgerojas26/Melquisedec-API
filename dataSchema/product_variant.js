const Joi = require('joi');

const schema = Joi.object().keys({
  productId: Joi.number().allow(null).required(),
  name: Joi.string().required().messages({
    'string.empty': 'El campo nombre es requerido',
  }),
  price: Joi.number().min(0).required().messages({
    'number.empty': 'El campo precio es requerido',
  }),
  unitValue: Joi.number().min(0).required().messages({
    'number.empty': 'El campo valor unidad es requerido',
  }),
  imagePath: Joi.string().allow(null).allow(''),
  createdAt: Joi.date().allow(''),
});

module.exports = schema;
