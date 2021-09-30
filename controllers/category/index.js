const prisma = require('../../prisma');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_CATEGORIES = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.category,
            queryFilters,
            paginationConfig: req.paginationConfig,
        });

        const response = { records: [...records], recordsTotal, pageCount };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
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
            data: { name },
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
