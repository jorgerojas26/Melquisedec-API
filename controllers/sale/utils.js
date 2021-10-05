const { convertArrayToObject } = require('../../utils/array');
const { CONVERT_TO_VES } = require('../../utils/currency');
const { GET_PRODUCT_VARIANT_NAME } = require('../../utils/product');
const { DateTime } = require('luxon');

const calculate_sale_total = (sale_product_array = [], rate_value, rate_rounding) => {
    let sale_total = 0;

    sale_product_array.forEach((product) => {
        sale_total += CONVERT_TO_VES(Number(product.price), rate_value, rate_rounding) * product.quantity;
    });

    return sale_total;
};

const calculate_payment_total = (paymentsArray = [], currency_rates) => {
    let payment_total = 0;

    paymentsArray.forEach((payment) => {
        if (payment.currency === 'USD') {
            const rate = currency_rates['PAYMENT_VES'];
            payment_total += payment.amount * rate.value;
        } else {
            payment_total += payment.amount;
        }
    });

    return payment_total;
};

const calculate_paying_debt_total = (paying_debts_array) => {
    let total = 0;
    paying_debts_array.forEach((sale) => {
        const sale_currency_rates = convertArrayToObject(sale.currencyRates, 'currency');
        const price_currency_rate = sale.currencyRates.filter((rate) => rate.currency === 'PRICE_VES')[0];

        const debt_sale_total = calculate_sale_total(sale.products, price_currency_rate.value, price_currency_rate.rounding);
        const debt_sale_payment_total = calculate_payment_total(sale.payment, sale_currency_rates);
        console.log('Debt sale total payment: ', debt_sale_payment_total);
        console.log('Debt sale total: ', debt_sale_total);
        total = debt_sale_total - debt_sale_payment_total;
    });
    return total;
};

const get_debt_payments = (paymentsArray = [], debt_creation_date) => {
    const debt_date = DateTime.fromISO(new Date(debt_creation_date).toISOString());

    return paymentsArray.filter((payment) => {
        const paymentDate = DateTime.fromISO(new Date(payment.createdAt).toISOString());
        if (paymentDate > debt_date) {
            return payment;
        }
    });
};

const get_higher_payment = (paymentsArray, currencyRates) => {
    return paymentsArray.reduce(
        (prev, current) => {
            let amount = 0;
            if (current.currency === 'VES') {
                amount = current.amount;
            } else if (current.currency === 'USD') {
                amount = CONVERT_TO_VES(current.amount, currencyRates['PAYMENT_VES'].value);
            }
            return amount > prev.amount ? current : prev;
        },
        { amount: 0 }
    );
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

const map_payment_info_to_database_schema = (paymentInfo) => {
    return paymentInfo.map((payment) => {
        return {
            payment_method: { connect: { id: Number(payment.payment_method_id) } },
            amount: payment.isChange ? -payment.amount : payment.amount,
            currency: payment.currency,
            transaction_code: payment.transaction_code || null,
            bank: payment.bank_id ? { connect: payment.bank_id } : undefined,
        };
    });
};

const map_products_to_database_schema = (databaseProducts, requestProducts) => {
    return databaseProducts.map((product) => {
        return {
            price: product.price,
            quantity: requestProducts.find((p) => p.id === product.id).quantity,
            profitPercent: product.profitPercent,
            product_variant: { connect: { id: product.id } },
        };
    });
};
module.exports = {
    calculate_payment_total,
    calculate_sale_total,
    calculate_paying_debt_total,
    get_debt_payments,
    validate_product_info,
    get_higher_payment,
    map_payment_info_to_database_schema,
    map_products_to_database_schema,
};
