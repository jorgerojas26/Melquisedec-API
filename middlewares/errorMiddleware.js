const { PrismaClientValidationError } = require("@prisma/client/runtime");

const GET_ERROR = {
  P2002: (error) => {
    const path = error.meta.target.split("_")[0];

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
      message: "El registro que intentas actualizar no existe",
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
  P2021: (error) => {
    const table = error.meta.table;
    return {
      message: `La tabla '${table}' no existe en la base de datos`,
      path: undefined,
    };
  },
  VALIDATION_ERROR: () => {
    return {
      message: "El argumento tiene un valor inválido",
      path: undefined,
    };
  },
};
const errorMiddleware = (error, req, res, next) => {
  const unknownError = {
    message: "Error desconocido...",
    path: undefined,
  };
  console.log(error);

  if (error instanceof PrismaClientValidationError) {
    error.code = "VALIDATION_ERROR";
  }
  res.status(error.statusCode || 500).json({ error: GET_ERROR[error.code] ? GET_ERROR[error.code](error) : unknownError });
};

module.exports = errorMiddleware;
