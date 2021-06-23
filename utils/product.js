const CONVERT_PRODUCT_PRICE = (price, currency, value, rounding) => {
  return { [`price${currency}`]: rounding > 1 ? Math.ceil((price * value) / rounding) * rounding : parseFloat((price * value).toFixed(2)) };
};

const SET_ALL_CURRENCY_PRICES = ({ products, currencyRates }) => {
  return products.map((variant) => {
    currencyRates.forEach((rate) => {
      let price = CONVERT_PRODUCT_PRICE(variant.price, rate.currency, rate.value, rate.rounding);
      variant = { ...variant, ...price };
    });
    return variant;
  });
};

module.exports = {
  CONVERT_PRODUCT_PRICE,
  SET_ALL_CURRENCY_PRICES,
};
