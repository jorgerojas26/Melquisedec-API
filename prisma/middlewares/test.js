const test_object = {
    id: 4,
    clientId: 1,
    totalAmount: 2.563414634146342,
    status: 1,
    products: [
        {
            id: 4,
            saleId: 4,
            product_variant_id: 6,
            price: 1.196,
            quantity: 1,
            profitPercent: 30,
            product_variant: [{ id: 1 }],
        },
        {
            id: 5,
            saleId: 4,
            product_variant_id: 2,
            price: 1.365,
            quantity: 1,
            profitPercent: 30,
            product_variant: [{ id: 2 }],
        },
        {
            id: 6,
            saleId: 4,
            product_variant_id: 1,
            price: 0.13,
            quantity: 1,
            profitPercent: 30,
            product_variant: [{ id: 3 }],
        },
    ],
    debt: null,
    payment: [
        {
            id: 3,
            payment_method_id: 3,
            sale_id: 4,
            amount: 10510000,
            currency: 'VES',
            transaction_code: null,
            bank_id: null,
            payment_method: [Object],
        },
    ],
    client: {
        id: 1,
        name: 'Jorge Rojas',
        cedula: '24233306',
        phoneNumber: '04124192604',
    },
    currencyRates: [
        {
            id: 22,
            saleId: 4,
            currency: 'PRICE_VES',
            value: 3900000,
            rounding: 10000,
        },
        {
            id: 23,
            saleId: 4,
            currency: 'PRICE_EUR',
            value: 0.86,
            rounding: 0,
        },
        {
            id: 24,
            saleId: 4,
            currency: 'PRICE_PAYPAL',
            value: 1.087,
            rounding: 0,
        },
        {
            id: 25,
            saleId: 4,
            currency: 'PAYMENT_VES',
            value: 4100000,
            rounding: 0,
        },
        {
            id: 26,
            saleId: 4,
            currency: 'PAYMENT_EUR',
            value: 0.86,
            rounding: 0,
        },
    ],
};

var all_ocurrences = [];
function findAllByKey(obj, keyToFind) {
    return (
        Object.entries(obj).reduce(
            (acc, [key, value]) =>
                key === keyToFind
                    ? acc.concat(value)
                    : typeof value === 'object' && value
                    ? acc.concat(findAllByKey(value, keyToFind))
                    : acc,
            []
        ) || []
    );
}

console.log(findAllByKey(test_object, 'product_variant'));
