const { PrismaClientValidationError } = require('@prisma/client/runtime');

const GET_ERROR = {
    P2002: (error) => {
        const path = error.meta.target.split('_')[0];

        return {
            message: `${path} ya existe`,
            path,
        };
    },
    SCHEMA_VALIDATION: (error) => {
        return error.error;
    },
    P2025: () => {
        return {
            message: 'El registro que intentas actualizar no existe',
            path: undefined,
        };
    },
    P2003: (error) => {
        const field = error.meta.field_name;

        return {
            message: `${field} no existe`,
            path: field,
        };
    },
    VALIDATION_ERROR: () => {
        return {
            message: 'El argumento tiene un valor inválido',
            path: undefined,
        };
    },
};
const errorMiddleware = (error, req, res, next) => {
    console.log(error);
    if (error instanceof PrismaClientValidationError) {
        error.code = 'VALIDATION_ERROR';
    }
    res.status(400).json({ error: GET_ERROR[error.code] ? GET_ERROR[error.code](error) : error });
};

module.exports = errorMiddleware;
