const CONVERT_PRODUCT_PRICE = (price, currency, value, rounding) => {
    return {
        [currency]: rounding > 1 ? Math.ceil((price * value) / rounding) * rounding : parseFloat((price * value).toFixed(2)),
    };
};

const SET_ALL_CURRENCY_PRICES = ({ products, currencyRates }) => {
    return products.map((variant) => {
        currencyRates.forEach((rate) => {
            let price = CONVERT_PRODUCT_PRICE(variant.price, rate.currency, rate.value, rate.rounding);
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
    CONVERT_PRODUCT_PRICE,
    SET_ALL_CURRENCY_PRICES,
    CALCULATE_PROFIT_PERCENT,
    GET_PRODUCT_VARIANT_NAME,
};
