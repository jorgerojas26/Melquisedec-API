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
                sale: {
                    client: {
                        OR: [
                            idFilter,
                            { name: { contains: filter } },
                            { cedula: { contains: filter } },
                            { phoneNumber: { contains: filter } },
                        ],
                    },
                },
            },
        ],
    };

    return condition;
};

module.exports = filterHandler;
