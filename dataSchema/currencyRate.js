const Joi = require("joi");

const schema = Joi.object().keys({
  id: Joi.number().allow(null).allow(""),
  currency: Joi.string().required().min(3).max(3).messages({
    "string.empty": "El campo currency es requerido",
    "string.min": "El campo moneda debe contener mínimo 3 caracteres",
    "string.max": "El campo moneda debe contener máximo 3 caracteres",
  }),
  value: Joi.number().required().messages({
    "number.empty": "El campo tasa es requerido",
  }),
});

module.exports = schema;
