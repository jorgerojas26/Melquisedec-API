const CONVERT_PRICE_TO_CURRENCY_RATE = (price, currency, rate_value, rounding) => {
    return {
        [currency]: rounding > 1 ? Math.ceil((price * rate_value) / rounding) * rounding : parseFloat((price * rate_value).toFixed(2)),
    };
};

const CONVERT_AMOUNT_TO_CURRENCY_RATE = (amount, rate_value, rounding) => {
    return rounding > 1 ? Math.ceil((amount * rate_value) / rounding) * rounding : parseFloat((amount * rate_value).toFixed(2));
};

const SET_ALL_CURRENCY_PRICES = ({ products, currencyRates }) => {
    return products.map((variant) => {
        currencyRates.forEach((rate) => {
            let price = CONVERT_PRICE_TO_CURRENCY_RATE(variant.price, rate.currency, rate.value, rate.rounding);
            variant = { ...variant, converted_price: { ...variant.converted_price, ...price } };
            if (variant.product && variant.product.product_variant) {
                variant.product.product_variant = variant.product.product_variant.map((nestedVariant) => {
                    nestedVariant = { ...nestedVariant, ...price };
                    return nestedVariant;
                });
            }
        });

        return variant;
    });
};

const CALCULATE_PROFIT_PERCENT = (sellPrice, buyPrice) => {
    if (buyPrice) {
        const profit = (sellPrice * 100) / buyPrice;
        if (profit > 0) {
            return profit - 100;
        }
        return profit;
    }
    return null;
};

const GET_PRODUCT_VARIANT_NAME = (product_variant) => {
    return `${product_variant.product.name} ${product_variant.product.brand} ${product_variant.name}`;
};

module.exports = {
    CONVERT_PRICE_TO_CURRENCY_RATE,
    CONVERT_AMOUNT_TO_CURRENCY_RATE,
    SET_ALL_CURRENCY_PRICES,
    CALCULATE_PROFIT_PERCENT,
    GET_PRODUCT_VARIANT_NAME,
};
