const prisma = require('../../prisma');

const GET_ALL_MONEY = async (req, res, next) => {
    try {
        const response = await prisma.money.findMany({ include: { payment_method: true } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_MONEY = async (req, res, next) => {
    const { name, amount, currency } = req.body;

    try {
        const response = await prisma.money.create({ data: { name, amount, currency } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_MONEY = async (req, res, next) => {
    const { moneyId } = req.params;

    const { name, amount, currency, reasons } = req.body;

    try {
        const money = await prisma.money.findUnique({ where: { id: Number(moneyId) } });
        if (!money) {
            next({ message: 'La moneda no existe' });
            return;
        }

        const response = await prisma.money.update({
            where: { id: Number(moneyId) },
            data: {
                name,
                amount,
                currency,
                money_log: {
                    create: {
                        old_amount: money.amount,
                        new_amount: amount,
                        reasons,
                    },
                },
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_ALL_MONEY,
    CREATE_MONEY,
    UPDATE_MONEY,
};
