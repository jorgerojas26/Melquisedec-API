const prisma = require('../../prisma');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { CONVERT_AMOUNTS_TO_CURRENCY_RATE } = require('./utils');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');
const { CONVERT_AMOUNT_TO_ALL_CURRENCIES } = require('../../utils/product');

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
                    include: {
                        debt: true,
                        payment: { include: { payment_method: { select: { name: true } } } },
                        products: { include: { product_variant: { include: { product: true } } } },
                    },
                },
            },
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
