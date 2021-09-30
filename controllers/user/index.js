const prisma = require('../../prisma');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_USERS = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.user,
            queryFilters,
            paginationConfig: req.paginationConfig,
        });

        const response = {
            records: [...records],
            recordsTotal,
            pageCount,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
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
            data: { username, permissions },
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
