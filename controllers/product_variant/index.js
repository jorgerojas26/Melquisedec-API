const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { convertMySQLDecimalToNumber } = require('../../utils/convertToNumber');

const fetch_product_variants_in = async (ids_array) => {
    const currencyRates = await prisma.currency_rate.findMany();

    let records = await prisma.product_variant.findMany({
        where: { id: { in: ids_array } },
        include: { product: true },
    });

    records = convertMySQLDecimalToNumber(records);
    records = SET_ALL_CURRENCY_PRICES({ products: records, currencyRates });
    return records;
};

const fetch_paginated_product_variants = async ({ queryFilters = {}, paginationConfig = {} }) => {
    const currencyRates = await prisma.currency_rate.findMany();

    let { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
        model: prisma.product_variant,
        queryFilters,
        paginationConfig: paginationConfig,
        include: {
            product: {
                include: {
                    product_variant: {
                        select: {
                            id: true,
                            productId: false,
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
    });

    records = convertMySQLDecimalToNumber(records);
    records = SET_ALL_CURRENCY_PRICES({ products: records, currencyRates });

    return { records, recordsTotal, pageCount };
};

const GET_PRODUCT_VARIANTS = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { records, recordsTotal, pageCount } = await fetch_paginated_product_variants({
            queryFilters,
            paginationConfig: req.paginationConfig,
        });
        const response = { records: [...records], recordsTotal, pageCount };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_PRODUCT_VARIANT_BY_ID = async (req, res, next) => {
    const { id } = req.params;

    try {
        let product = await prisma.product_variant.findUnique({
            where: { id: parseInt(id) },
            include: { product: true },
        });

        const currencyRates = await prisma.currency_rate.findMany();

        product = SET_ALL_CURRENCY_PRICES({ products: [product], currencyRates });
        res.json(product[0]);
    } catch (error) {
        next(error);
    }
};

const GET_SUPPLYINGS = async (req, res, next) => {
    let { id } = req.params;
    id = parseInt(id);

    try {
        let { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.supplying,
            queryFilters: {
                where: {
                    product_variant: {
                        id,
                    },
                },
            },
            paginationConfig: req.paginationConfig,
            include: {
                product_variant: {
                    include: { product: true },
                },
                supplier: true,
            },
        });
        const response = { records: [...records], recordsTotal, pageCount };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_PRODUCT_VARIANT = async (req, res, next) => {
    const { productId, name, price, unitValue, imagePath } = req.body;

    try {
        const response = await prisma.product_variant.create({
            data: {
                productId: parseInt(productId),
                name,
                price: parseFloat(price),
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
    const { name, price, unitValue, imagePath } = req.body;

    try {
        const response = await prisma.product_variant.update({
            where: { id: parseInt(id) },
            data: { name, price, unitValue, imagePath },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_PRODUCT_VARIANT = async (req, res, next) => {
    /*
  const { id } = req.params;

  try {
    let response = await prisma.product_variant.delete({ where: { id: parseInt(id) } });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
  */
    res.status(405).json({ error: { message: 'No puedes eliminar un producto', path: null } });
};

module.exports = {
    GET_PRODUCT_VARIANTS,
    GET_PRODUCT_VARIANT_BY_ID,
    UPDATE_PRODUCT_VARIANT,
    CREATE_PRODUCT_VARIANT,
    DELETE_PRODUCT_VARIANT,
    GET_SUPPLYINGS,
    fetch_product_variants_in,
};
