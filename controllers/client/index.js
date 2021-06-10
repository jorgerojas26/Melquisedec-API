const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');

const GET_CLIENTS = async (req, res, next) => {
    let { filter } = req.query;

    let queryFilters = {};

    let { skip, take } = req.paginationConfig;

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        var recordsTotal = await prisma.client.count(queryFilters);
        if (recordsTotal < take) skip = 0;

        var records = await prisma.client.findMany({
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
            data: {
                name,
                cedula,
                phoneNumber,
            },
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
