const PAGE_SIZE = 10;

const paginate = (req, res, next) => {
    let { page = 1, count = PAGE_SIZE } = req.query;
    count = parseInt(count);

    req.paginationConfig = { skip: 0, take: count };

    if (page) {
        let paginationConfig = {};
        let offset = 0;

        page = parseInt(page);

        offset = (page - 1) * count;

        paginationConfig.skip = offset;
        paginationConfig.take = count;

        req.paginationConfig = paginationConfig;
    }
    next();
};

module.exports = paginate;
