const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { setImagePath, productExists, variantsToBeDeleted, setCRUDAction } = require('./utils');

const filterHandler = require('./filters');

const GET_PRODUCTS = async (req, res, next) => {
  let { filter } = req.query;

  let queryFilters = {};

  let { skip, take } = req.paginationConfig;

  if (filter) {
    queryFilters.where = filterHandler(filter);
  }
  try {
    var recordsTotal = await prisma.product.count(queryFilters);
    if (recordsTotal < take) skip = 0;

    var records = await prisma.product.findMany({
      skip,
      take,
      include: { product_variant: true, ...queryFilters },
      orderBy: { createdAt: 'desc' },
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

const GET_PRODUCT = async (req, res, next) => {
  const { id } = req.params;

  try {
    const response = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { product_variant: true },
    });
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const CREATE_PRODUCT = async (req, res, next) => {
  let { name, brand, variantsWithImage, product_variant } = req.body;
  name = brand != 'undefined' ? name + ' ' + brand : name;
  product_variant = JSON.parse(product_variant);
  variantsWithImage = JSON.parse(variantsWithImage);
  product_variant = setImagePath(variantsWithImage, product_variant, req);

  try {
    const response = await prisma.product.create({
      data: {
        name,
        product_variant: {
          create: product_variant,
        },
      },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const UPDATE_PRODUCT = async (req, res, next) => {
  const { id } = req.params;
  let { name, brand, variantsWithImage, product_variant } = req.body;
  name = brand != 'undefined' ? name + ' ' + brand : name;
  product_variant = JSON.parse(product_variant);
  variantsWithImage = JSON.parse(variantsWithImage);
  product_variant = setImagePath(variantsWithImage, product_variant, req);

  try {
    const product = await productExists(id);
    if (!product) {
      res.status(404).json({
        error: {
          message: 'Este producto no existe',
          path: undefined,
        },
      });
    } else {
      const allVariants = variantsToBeDeleted(product.product_variant, product_variant);

      let response = null;
      for (const variant of allVariants) {
        const crudAction = setCRUDAction(variant);

        response = await prisma.product.update({
          where: { id: parseInt(id) },
          data: {
            name,
            product_variant: {
              ...crudAction,
            },
          },
        });
      }
      res.status(200).json(response);
    }
  } catch (error) {
    next(error);
  }
};

const DELETE_PRODUCT = async (req, res, next) => {
  //const { id } = req.params;
  /*
    try {
        let response = await prisma.product.delete({ where: { id: parseInt(id) } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
    */
  res.json({
    error: {
      message: 'No puedes eliminar un producto',
      path: null,
    },
  });
};

module.exports = {
  GET_PRODUCTS,
  GET_PRODUCT,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
};
