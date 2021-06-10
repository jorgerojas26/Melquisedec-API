const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');

const GET_USERS = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    let { skip, take } = req.paginationConfig;

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        var recordsTotal = await prisma.user.count(queryFilters);
        if (recordsTotal < take) skip = 0;

        var records = await prisma.user.findMany({
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

const CREATE_USER = async (req, res, next) => {
    const { username, password, permissions } = req.body;

    try {
        const response = await prisma.user.create({ data: { username, password, permissions } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_USER = async (req, res, next) => {
    const { id } = req.params;
    const { username, permissions } = req.body;

    try {
        const response = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                username,
                permissions,
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_USER = async (req, res, next) => {
    const { id } = req.params;

    try {
        let response = await prisma.user.delete({ where: { id: parseInt(id) } });
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_USERS,
    CREATE_USER,
    UPDATE_USER,
    DELETE_USER,
};
