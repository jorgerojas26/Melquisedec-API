const Joi = require('joi');

const schema = Joi.object().keys({
  id: Joi.number().allow(null).allow(''),
  name: Joi.string().required().messages({
    'string.empty': 'El campo nombre es requerido',
  }),
  brand: Joi.string().allow(null).allow(''),
  variantsWithImage: Joi.array().allow(null),
  product_variant: Joi.array().items(
    Joi.object().keys({
      id: Joi.number().allow(null).allow(''),
      productId: Joi.number().allow(null).allow(''),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      unitValue: Joi.number().min(0).required(),
      stock: Joi.number().min(0).allow(null).allow(''),
      imagePath: Joi.alternatives(Joi.string(), Joi.object()).allow(null).allow('').allow({}),
      createdAt: Joi.date().allow(''),
    })
  ),
  createdAt: Joi.date().allow(''),
});

module.exports = schema;
