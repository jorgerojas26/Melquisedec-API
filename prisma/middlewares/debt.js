const prisma = require('../index');
const { CONVERT_FROM_USD_TO_ALL_CURRENCIES } = require('../../utils/currency');
const { FIND_OBJECT_BY_KEY, FIND_OBJECT_TO_MODIFY } = require('./utils');

prisma.$use(async (params, next) => {
    let results = await next(params);

    if (
        (params.model === 'debt' && params.action.startsWith('find')) ||
        (params.action.startsWith('find') && params.args && params.args.include && FIND_OBJECT_BY_KEY(params.args.include, 'debt').length)
    ) {
        const currency_rates = await prisma.currency_rate.findMany();
        const currency_rates_payment_array = currency_rates.filter((r) => r.currency.startsWith('PAYMENT'));
        return [].concat(results).map((result) => {
            let debt_object_container = FIND_OBJECT_TO_MODIFY(params, result, 'debt');

            [].concat(debt_object_container).map((obj) => {
                [].concat(obj).map((debt) => {
                    debt.converted_amount = CONVERT_FROM_USD_TO_ALL_CURRENCIES(debt.current_amount, currency_rates_payment_array);
                    debt.current_amount = Number(debt.current_amount);
                    debt.original_amount = Number(debt.original_amount);
                    return debt;
                });
            });
            return result;
        });
    }
    return results;
});
