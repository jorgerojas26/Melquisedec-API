const CONVERT_TO_VES = (amount, rate_value, rounding) => {
    return rounding ? Math.ceil((amount * rate_value) / rounding) * rounding : parseFloat(amount * rate_value).toFixed(2);
};

const CONVERT_FROM_VES_TO_CURRENCY_RATE = (VES_amount, rate_value) => {
    return parseFloat(VES_amount / rate_value).toFixed(2);
};

const CONVERT_FROM_USD_TO_ALL_CURRENCIES = (USD_amount = 0, currency_rates = []) => {
    let converted_amount = {};
    currency_rates.forEach((rate) => {
        converted_amount[rate.currency] = Number(parseFloat(USD_amount * rate.value).toFixed(2));
        if (rate.rounding) {
            converted_amount[rate.currency] = Math.ceil((USD_amount * rate.value) / rate.rounding) * rate.rounding;
        }
    });
    return converted_amount;
};

const CONVERT_FROM_VES_TO_ALL_CURRENCIES = (VES_amount = 0, currency_rates = []) => {
    let converted_amount = {};
    currency_rates.forEach((rate) => {
        converted_amount[rate.currency] = parseFloat(VES_amount / rate.value).toFixed(2);
    });
    return converted_amount;
};

module.exports = {
    CONVERT_TO_VES,
    CONVERT_FROM_VES_TO_CURRENCY_RATE,
    CONVERT_FROM_USD_TO_ALL_CURRENCIES,
    CONVERT_FROM_VES_TO_ALL_CURRENCIES,
};
