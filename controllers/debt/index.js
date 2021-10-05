const prisma = require('../../prisma');
const filterHandler = require('./filters');

const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_DEBTS = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    let { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
        model: prisma.debt,
        queryFilters,
        paginationConfig: req.paginationConfig,
        include: {
            sale: {
                include: {
                    client: true,
                    products: { include: { product_variant: { include: { product: true } } } },
                    payment: { include: { payment_method: true } },
                    currencyRates: true,
                    debt: true,
                },
            },
        },
    });

    records = records.map((debt) => {
        debt.original_amount = Number(debt.original_amount);
        debt.current_amount = Number(debt.current_amount);
        return debt;
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
    GET_DEBTS,
};
