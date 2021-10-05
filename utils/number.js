const round_decimals = (v, n) => {
    return Math.ceil(v * Math.pow(10, n)) / Math.pow(10, n);
};

module.exports = {
    round_decimals,
};
