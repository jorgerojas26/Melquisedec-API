const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_PAYMENT_METHODS = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.payment_method,
            queryFilters,
            paginationConfig: req.paginationConfig,
            orderBy: { name: 'asc' },
        });
        const response = { records: [...records], recordsTotal, pageCount };

        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

const CREATE_PAYMENT_METHOD = async (req, res, next) => {
    const { name } = req.body;

    try {
        const response = await prisma.payment_method.create({ data: { name } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_PAYMENT_METHOD = async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const response = await prisma.payment_method.update({
            where: { id: parseInt(id) },
            data: { name },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_PAYMENT_METHOD = async (req, res, next) => {
    const { id } = req.params;

    try {
        let response = await prisma.payment_method.delete({ where: { id: parseInt(id) } });
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_PAYMENT_METHODS,
    CREATE_PAYMENT_METHOD,
    UPDATE_PAYMENT_METHOD,
    DELETE_PAYMENT_METHOD,
};
