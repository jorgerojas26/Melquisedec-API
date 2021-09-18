const groupArrayBy = (array, key) => {
    return array.reduce((acc, obj) => {
        const property = obj[key];
        acc[property] = acc[property] || [];
        acc[property].push(obj);
        return acc;
    }, {});
};

module.exports = {
    groupArrayBy,
};
