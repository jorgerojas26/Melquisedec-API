const filterHandler = (filter) => {
    let condition = {};

    let idFilter = {};
    let priceFilter = {};
    let profitPercentFilter = {};
    let unitValueFilter = {};
    let stockFilter = {};

    if (!isNaN(filter)) {
        idFilter = {
            id: {
                equals: parseInt(filter),
            },
        };
        priceFilter = {
            price: {
                equals: parseFloat(filter),
            },
        };
        profitPercentFilter = {
            profitPercent: {
                equals: parseFloat(filter),
            },
        };
        unitValueFilter = {
            unitValue: {
                equals: parseFloat(filter),
            },
        };
        stockFilter = {
            stock: {
                equals: parseFloat(filter),
            },
        };
    }

    condition = {
        OR: [
            idFilter,
            {
                name: { contains: filter },
            },
            priceFilter,
            profitPercentFilter,
            unitValueFilter,
            stockFilter,
            {
                product: {
                    ...idFilter,
                    name: { contains: filter },
                },
            },
        ],
    };

    return condition;
};

module.exports = filterHandler;
