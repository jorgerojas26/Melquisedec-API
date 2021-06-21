exports.CONVERT_PRODUCT_PRICE = (price, currency, value, rounding) => {
  return { [`price${currency}`]: rounding > 1 ? Math.ceil((price * value) / rounding) * rounding : parseFloat((price * value).toFixed(2)) };
};
