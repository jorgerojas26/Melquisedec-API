const filterHandler = (filter) => {
    let condition = {};

    let idFilter = {};
    let permissionsFilter = {};

    if (!isNaN(filter)) {
        idFilter = {
            id: {
                equals: parseInt(filter),
            },
        };
        permissionsFilter = {
            permissions: {
                equals: parseInt(filter),
            },
        };
    }

    condition = {
        OR: [
            idFilter,
            {
                username: { contains: filter },
            },
            permissionsFilter,
        ],
    };

    return condition;
};

module.exports = filterHandler;
