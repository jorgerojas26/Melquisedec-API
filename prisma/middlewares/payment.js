const prisma = require('../index');
const { FIND_OBJECT_BY_KEY, FIND_OBJECT_TO_MODIFY } = require('./utils');

prisma.$use(async (params, next) => {
    let results = await next(params);

    if (
        (params.model === 'payment' && params.action.startsWith('find')) ||
        (params.action.startsWith('find') &&
            params.args &&
            params.args.include &&
            FIND_OBJECT_BY_KEY(params.args.include, 'payment').length)
    ) {
        return [].concat(results).map((result) => {
            let payment_object_container = FIND_OBJECT_TO_MODIFY(params, result, 'payment');

            [].concat(payment_object_container).map((obj) => {
                if (obj) {
                    [].concat(obj).map((payment) => {
                        payment.amount = Number(payment.amount);
                        payment.name = payment.payment_method.name;
                        delete payment.payment_method;
                        return payment;
                    });
                }
            });
            return result;
        });
    }
    return results;
});
