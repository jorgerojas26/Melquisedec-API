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
            message: 'El registro no existe',
        };
    },
    P2003: (error) => {
        const field = error.meta.field_name;

        return {
            message: `${field} no existe`,
            path: field,
        };
    },
    P2021: (error) => {
        const table = error.meta.table;
        return {
            message: `La tabla '${table}' no existe en la base de datos`,
        };
    },
    P2014: (error) => {
        const modelA = error.meta.model_a_name;
        const modelB = error.meta.model_b_name;

        return {
            message: `No se puede eliminar un ${modelA} porque está en relación con ${modelB}`,
        };
    },
    VALIDATION_ERROR: () => {
        return {
            message: 'El argumento tiene un valor inválido',
        };
    },
};
const errorMiddleware = (error, req, res, next) => {
    const unknownError = {
        message: 'Error desconocido...',
    };
    console.log(error);

    if (error instanceof PrismaClientValidationError) {
        error.code = 'VALIDATION_ERROR';
    }
    res.status(error.statusCode || 500).json({ error: GET_ERROR[error.code] ? GET_ERROR[error.code](error) : unknownError });
};

module.exports = errorMiddleware;
