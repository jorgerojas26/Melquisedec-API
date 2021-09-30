const prisma = require('../index');

const { FIND_OBJECT_BY_KEY, SET_PRODUCT_FULL_NAME, FIND_OBJECT_TO_MODIFY } = require('./utils');
const { CONVERT_FROM_USD_TO_ALL_CURRENCIES } = require('../../utils/currency');

prisma.$use(async (params, next) => {
    let results = await next(params);

    if (
        (params.model === 'product_variant' && params.action.startsWith('find')) ||
        (params.action.startsWith('find') &&
            params.args &&
            params.args.include &&
            FIND_OBJECT_BY_KEY(params.args.include, 'product_variant').length)
    ) {
        const currency_rates = await prisma.currency_rate.findMany();
        const currency_rates_price_array = currency_rates.filter((r) => r.currency.startsWith('PRICE'));

        results = [].concat(results).map((result) => {
            let product_variant_object_container = FIND_OBJECT_TO_MODIFY(params, result, 'product_variant');

            [].concat(product_variant_object_container).map((obj) => {
                [].concat(obj).map((product_variant) => {
                    product_variant.converted_price = CONVERT_FROM_USD_TO_ALL_CURRENCIES(product_variant.price, currency_rates_price_array);
                    product_variant.name = SET_PRODUCT_FULL_NAME(product_variant);
                    product_variant.price = Number(product_variant.price);
                    product_variant.profitPercent = Number(product_variant.profitPercent);
                    product_variant.unitValue = Number(product_variant.unitValue);
                    product_variant.stock = Number(product_variant.stock);
                    return product_variant;
                });
            });
            return result;
        });
    }

    return results;
});
