const CONVERT_PRODUCT_PRICE = (price, currency, value, rounding) => {
  return { [`price${currency}`]: rounding > 1 ? Math.ceil((price * value) / rounding) * rounding : parseFloat((price * value).toFixed(2)) };
};

const SET_ALL_CURRENCY_PRICES = ({ products, currencyRates }) => {
  return products.map((variant) => {
    currencyRates.forEach((rate) => {
      let price = CONVERT_PRODUCT_PRICE(variant.price, rate.currency, rate.value, rate.rounding);
      variant = { ...variant, ...price };
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

module.exports = {
  CONVERT_PRODUCT_PRICE,
  SET_ALL_CURRENCY_PRICES,
  CALCULATE_PROFIT_PERCENT,
};
