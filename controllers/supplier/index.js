const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');

const GET_SUPPLIERS = async (req, res, next) => {
    let { filter } = req.query;

    let queryFilters = {};

    let { skip, take } = req.paginationConfig;

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        var recordsTotal = await prisma.supplier.count(queryFilters);
        if (recordsTotal < take) skip = 0;

        var records = await prisma.supplier.findMany({
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

const CREATE_SUPPLIER = async (req, res, next) => {
    const { name, rif, address, phoneNumber } = req.body;

    try {
        const response = await prisma.supplier.create({ data: { name, rif, address, phoneNumber } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_SUPPLIER = async (req, res, next) => {
    const { id } = req.params;
    const { name, rif, address, phoneNumber } = req.body;

    try {
        const response = await prisma.supplier.update({
            where: { id: parseInt(id) },
            data: {
                name,
                rif,
                address,
                phoneNumber,
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_SUPPLIER = async (req, res, next) => {
    const { id } = req.params;

    try {
        let response = await prisma.supplier.delete({ where: { id: parseInt(id) } });
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SUPPLIERS,
    CREATE_SUPPLIER,
    UPDATE_SUPPLIER,
    DELETE_SUPPLIER,
};
