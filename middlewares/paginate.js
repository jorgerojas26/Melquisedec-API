const PAGE_SIZE = 15;

const paginate = (req, res, next) => {
    let { page = 1 } = req.query;

    req.paginationConfig = { skip: 0, take: PAGE_SIZE };

    if (page) {
        let paginationConfig = {};
        let offset = 0;

        page = parseInt(page);

        offset = (page - 1) * PAGE_SIZE;

        paginationConfig.skip = offset;
        paginationConfig.take = PAGE_SIZE;

        req.paginationConfig = paginationConfig;
    }
    next();
};

module.exports = paginate;
