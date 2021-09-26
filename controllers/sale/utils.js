const { groupArrayBy } = require('../../utils/array');
const { GET_PRODUCT_VARIANT_NAME, CONVERT_AMOUNT_TO_CURRENCY_RATE } = require('../../utils/product');

const calculate_payment_total = (paymentsArray = [], currencyRates) => {
    const paymentsGroupedByName = groupArrayBy(paymentsArray, 'name');

    for (let key of Object.keys(paymentsGroupedByName)) {
        const paymentsInfo = paymentsGroupedByName[key];

        paymentsGroupedByName[key] = paymentsInfo.reduce((accumulator, payment) => {
            if ((payment.currency && payment.currency === 'VES') || !payment.currency) {
                accumulator += payment.isChange ? -Number(payment.amount) || 0 : Number(payment.amount) || 0;
            } else if (payment.currency && payment.currency === 'USD') {
                accumulator += CONVERT_AMOUNT_TO_CURRENCY_RATE(
                    payment.isChange ? -payment.amount || 0 : payment.amount || 0,
                    currencyRates['SYSTEM_USD'].value || 0,
                    currencyRates['SYSTEM_USD'].rounding || 1
                );
                console.log(
                    CONVERT_AMOUNT_TO_CURRENCY_RATE(
                        payment.isChange ? -payment.amount || 0 : payment.amount || 0,
                        currencyRates['SYSTEM_USD'].value || 0,
                        currencyRates['SYSTEM_USD'].rounding || 1
                    )
                );
            }
            return accumulator;
        }, 0);
    }

    const totalPayment = Object.keys(paymentsGroupedByName).reduce((accumulator, key) => {
        return accumulator + paymentsGroupedByName[key];
    }, 0);

    return totalPayment;
};

const validate_product_info = (databaseProducts, requestProducts) => {
    let error = null;
    for (let product of requestProducts) {
        const databaseProduct = databaseProducts.find((databaseProduct) => databaseProduct.id === product.id);

        if (!databaseProduct) {
            error = { message: `El producto no existe`, statusCode: 404 };
        }
        if (!databaseProduct.price) {
            error = { message: `El producto no tiene un precio definido`, statusCode: 422 };
        }
        if (product.quantity > databaseProduct.stock) {
            error = { message: `${GET_PRODUCT_VARIANT_NAME(databaseProduct)} no tiene suficiente stock`, statusCode: 422 };
        }
    }

    return { error };
};

module.exports = {
    calculate_payment_total,
    validate_product_info,
};
