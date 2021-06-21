const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const filterHandler = require("./filter");

const GET_CURRENCY_RATES = async (req, res, next) => {
  let { filter } = req.query;

  let queryFilters = {};

  if (filter) {
    queryFilters.where = filterHandler(filter);
  }

  try {
    var records = await prisma.currencyRate.findMany({
      ...queryFilters,
    });

    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

const GET_CURRENCY_RATE = async (req, res, next) => {
  const { currencySymbol } = req.params;

  try {
    const currencyRate = await prisma.currencyRate.findUnique({
      where: { currency: currencySymbol },
    });
    if (currencyRate) {
      res.status(200).json(currencyRate);
    } else {
      res.status(404).json({
        error: {
          message: "Currency not found",
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

const CREATE_CURRENCY_RATE = async (req, res, next) => {
  const { currency, value } = req.body;

  try {
    const response = await prisma.currencyRate.create({
      data: { currency, value },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const UPDATE_CURRENCY_RATE = async (req, res, next) => {
  const { currencySymbol } = req.params;
  const { currency, value } = req.body;

  try {
    const response = await prisma.currencyRate.update({
      where: { currency: currencySymbol },
      data: { currency, value },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  GET_CURRENCY_RATES,
  GET_CURRENCY_RATE,
  CREATE_CURRENCY_RATE,
  UPDATE_CURRENCY_RATE,
};
