const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { fetch_currency_rates } = require('../currencyRate');
const { CONVERT_AMOUNTS_TO_CURRENCY_RATE } = require('./utils');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');

const GET_CLIENTS = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.client,
            queryFilters,
            paginationConfig: req.paginationConfig,
            include: {
                sale: {
                    where: { debt: { paid: { equals: 0 } } },
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        debt: true,
                        payment: {
                            include: {
                                payment_method: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        products: {
                            select: {
                                product_variant: {
                                    select: {
                                        name: true,
                                        product: {
                                            select: {
                                                name: true,
                                                brand: true,
                                            },
                                        },
                                    },
                                },
                                price: true,
                                quantity: true,
                                profitPercent: true,
                            },
                        },
                        createdAt: true,
                    },
                },
            },
        });
        const currencyRates = await prisma.currency_rate.findMany({ where: { currency: 'USD' } });
        const all_currency_rates = await prisma.currency_rate.findMany();

        records.map((record) => {
            if (record.sale.length) {
                record.sale = CONVERT_AMOUNTS_TO_CURRENCY_RATE({ sales: record.sale, currencyRates });
            }
        });

        records.map((record) => {
            record.sale.forEach((sale) => {
                sale.products = SET_ALL_CURRENCY_PRICES({ products: sale.products, currencyRates: all_currency_rates });
            });
        });

        const response = { records: [...records], recordsTotal, pageCount };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_CLIENT = async (req, res, next) => {
    const { name, cedula, phoneNumber } = req.body;

    try {
        const response = await prisma.client.create({ data: { name, cedula, phoneNumber } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_CLIENT = async (req, res, next) => {
    const { id } = req.params;
    const { name, cedula, phoneNumber } = req.body;

    try {
        const response = await prisma.client.update({
            where: { id: parseInt(id) },
            data: { name, cedula, phoneNumber },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_CLIENT = async (req, res, next) => {
    const { id } = req.params;

    try {
        let response = await prisma.client.delete({ where: { id: parseInt(id) } });
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_CLIENTS,
    CREATE_CLIENT,
    UPDATE_CLIENT,
    DELETE_CLIENT,
};
