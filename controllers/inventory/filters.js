const filterHandler = (filter) => {
    let condition = {};

    let idFilter = {};

    if (!isNaN(filter)) {
        idFilter = {
            id: {
                equals: parseInt(filter),
            },
        };
    }

    condition = {
        OR: [
            idFilter,
            {
                product_variant: {
                    OR: [idFilter, { name: { contains: filter } }],
                },
            },
        ],
    };

    return condition;
};

module.exports = filterHandler;
