const prisma = require('../index');
const { CONVERT_FROM_USD_TO_ALL_CURRENCIES } = require('../../utils/currency');
const { FIND_OBJECT_BY_KEY, FIND_OBJECT_TO_MODIFY } = require('./utils');

prisma.$use(async (params, next) => {
    if (params.model === 'sale' && params.action.startsWith('find')) {
        params.args.include = { ...params.args.include, currencyRates: true };
    } else if (
        params.action.startsWith('find') &&
        params.args &&
        params.args.include &&
        FIND_OBJECT_BY_KEY(params.args.include, 'sale').length
    ) {
        let sale_include = FIND_OBJECT_TO_MODIFY(params, params.args.include, 'sale');
        [].concat(sale_include).map((sale) => {
            sale.include = {
                ...sale.include,
                currencyRates: true,
            };
        });
    }

    let results = await next(params);

    if (
        (params.model === 'sale' && params.action.startsWith('find')) ||
        (params.action.startsWith('find') && params.args && params.args.include && FIND_OBJECT_BY_KEY(params.args.include, 'sale').length)
    ) {
        return [].concat(results).map((result) => {
            let sale_object_container = FIND_OBJECT_TO_MODIFY(params, result, 'sale');
            [].concat(sale_object_container).map((obj) => {
                [].concat(obj).map((sale) => {
                    const currency_rates = sale.currencyRates;
                    const currency_rates_price_array = currency_rates.filter((rate) => rate.currency.startsWith('PRICE'));
                    const currency_rates_payment_array = currency_rates.filter((rate) => rate.currency.startsWith('PAYMENT'));

                    sale.converted_amount = CONVERT_FROM_USD_TO_ALL_CURRENCIES(sale.totalAmount, currency_rates_payment_array);

                    sale.totalAmount = Number(sale.totalAmount);

                    if (sale.products) {
                        sale.products = sale.products.map((product) => ({
                            ...product,
                            price: Number(product.price),
                            quantity: Number(product.quantity),
                            converted_price: CONVERT_FROM_USD_TO_ALL_CURRENCIES(product.price, currency_rates_price_array),
                            profitPercent: Number(product.profitPercent),
                        }));
                    }
                    return sale;
                });
            });

            return result;
        });
    }
    return results;
});

const set_sale_converted_amounts = (results) => {};
