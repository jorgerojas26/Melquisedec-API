const Joi = require('joi');

const schema = Joi.object().keys({
  id: Joi.number().allow(null).allow(''),
  product_variant_id: Joi.number().required().messages({
    'number.empty': 'La id de la variante del producto es requerida',
  }),
  supplierId: Joi.number().required().messages({
    'number.empty': 'La id del proveedor es requerida',
  }),
  buyPrice: Joi.number().min(0.0001).required().messages({
    'number.empty': 'Las unidades por paquete son requeridas',
    'number.min': 'El precio de compra no puede ser 0',
  }),
  quantity: Joi.number().min(0.0001).required().messages({
    'number.empty': 'La cantidad de paquetes es requerida',
    'number.min': 'La cantidad no puede ser 0',
  }),
});

module.exports = schema;
