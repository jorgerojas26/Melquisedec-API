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
                name: { contains: filter },
            },
            {
                rif: { contains: filter },
            },
            {
                address: { contains: filter },
            },
            {
                phoneNumber: { contains: filter },
            },
        ],
    };

    return condition;
};

module.exports = filterHandler;
