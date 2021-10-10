const prisma = require('../../prisma');
const filterHandler = require('./filters');

const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_ARBITRARY_MOVES = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    let { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
        model: prisma.arbitrary_stock_change,
        queryFilters,
        paginationConfig: req.paginationConfig,
        include: {
            product_variant: true,
        },
    });

    const response = {
        records: [...records],
        recordsTotal,
        pageCount,
    };

    res.status(200).json(response);
    try {
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_ARBITRARY_MOVES,
};
