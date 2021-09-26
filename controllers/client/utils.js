const { CONVERT_PRICE_TO_CURRENCY_RATE } = require('../../utils/product');

const CONVERT_AMOUNTS_TO_CURRENCY_RATE = ({ sales, currencyRates }) => {
    return sales.map((sale) => {
        currencyRates.forEach((rate) => {
            const amount = CONVERT_PRICE_TO_CURRENCY_RATE(sale.totalAmount, rate.currency, rate.value, rate.rounding);

            sale = { ...sale, converted_amount: { ...sale.converted_price, ...amount } };

            if (sale.debt) {
                const debtAmount = CONVERT_PRICE_TO_CURRENCY_RATE(sale.debt.amount, rate.currency, rate.value, rate.rounding);
                sale.debt = { ...sale.debt, converted_amount: { ...sale.debt.converted_amount, ...debtAmount } };
            }
        });

        return sale;
    });
};

module.exports = {
    CONVERT_AMOUNTS_TO_CURRENCY_RATE,
};
