const Joi = require('joi');

module.exports = function (schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;
            const errorMessage = details.map((detail) => {
                return {
                    message: detail.message,
                    path: detail.path[0],
                };
            });
            next({ error: errorMessage, code: 'SCHEMA_VALIDATION', statusCode: '422' });
        }
    };
};
