const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');

const GET_CATEGORIES = async (req, res, next) => {
    let { filter } = req.query;

    let queryFilters = {};

    let { skip, take } = req.paginationConfig;

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        var recordsTotal = await prisma.category.count(queryFilters);
        if (recordsTotal < take) skip = 0;

        var records = await prisma.category.findMany({
            ...queryFilters,
            skip,
            take,
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

const CREATE_CATEGORY = async (req, res, next) => {
    const { name } = req.body;

    try {
        const response = await prisma.category.create({ data: { name } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_CATEGORY = async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const response = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name,
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_CATEGORY = async (req, res, next) => {
    const { id } = req.params;

    try {
        let response = await prisma.category.delete({ where: { id: parseInt(id) } });
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_CATEGORIES,
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY,
};
