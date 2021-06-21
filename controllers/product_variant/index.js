const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { CONVERT_PRODUCT_PRICE } = require('../../utils/product');

const GET_PRODUCT_VARIANTS = async (req, res, next) => {
  const { filter } = req.query;

  let queryFilters = {};

  let { skip, take } = req.paginationConfig;

  if (filter) {
    queryFilters.where = filterHandler(filter);
  }

  try {
    var recordsTotal = await prisma.product_variant.count(queryFilters);
    const currencyRates = await prisma.currencyRate.findMany();

    if (recordsTotal < take) skip = 0;

    var records = await prisma.product_variant.findMany({
      ...queryFilters,
      skip,
      take,
      include: {
        product: {
          include: {
            product_variant: {
              select: {
                id: true,
                name: true,
                price: true,
                profitPercent: true,
                unitValue: true,
                stock: true,
                imagePath: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { productId: 'asc' },
    });

    records = records.map((variant) => {
      currencyRates.forEach((rate) => {
        let price = CONVERT_PRODUCT_PRICE(variant.price, rate.currency, rate.value, rate.rounding);
        variant = { ...variant, ...price };
      });
      return variant;
    });
  } catch (error) {
    next(error);
  }

  let pageCount = Math.ceil(recordsTotal / take);

  const response = {
    records: [...records],
    recordsTotal,
    pageCount,
  };
  res.json(response);
};

const CREATE_PRODUCT_VARIANT = async (req, res, next) => {
  const { productId, name, price, profitPercent, unitValue, imagePath } = req.body;

  try {
    const response = await prisma.product_variant.create({
      data: {
        productId: parseInt(productId),
        name,
        price: parseFloat(price),
        profitPercent: parseFloat(profitPercent),
        unitValue: parseFloat(unitValue),
        stock: 0,
        imagePath,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const UPDATE_PRODUCT_VARIANT = async (req, res, next) => {
  const { id } = req.params;
  const { name, price, profitPercent, unitValue, imagePath } = req.body;

  try {
    const response = await prisma.product_variant.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price,
        profitPercent,
        unitValue,
        imagePath,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const DELETE_PRODUCT_VARIANT = async (req, res, next) => {
  const { id } = req.params;

  try {
    let response = await prisma.product_variant.delete({ where: { id: parseInt(id) } });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  GET_PRODUCT_VARIANTS,
  UPDATE_PRODUCT_VARIANT,
  CREATE_PRODUCT_VARIANT,
  DELETE_PRODUCT_VARIANT,
};
