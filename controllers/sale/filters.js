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
                client: {
                    OR: [idFilter, { name: { contains: filter } }, { cedula: { contains: filter } }, { phoneNumber: { contains: filter } }],
                },
            },
            {
                products: {
                    some: {
                        product_variant: {
                            OR: [
                                idFilter,
                                { name: { contains: filter } },
                                {
                                    product: {
                                        OR: [{ name: { contains: filter } }, { brand: { contains: filter } }],
                                    },
                                },
                            ],
                        },
                    },
                },
            },
        ],
    };

    return condition;
};

module.exports = filterHandler;
