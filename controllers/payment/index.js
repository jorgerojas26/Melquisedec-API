const prisma = require('../../prisma');

const { map_payment_info_to_database_schema } = require('../sale/utils');

const CREATE_PAYMENT_FOR_SALE = async (req, res, next) => {
    const { id } = req.params;
    const { paymentInfo } = req.body;

    if (!paymentInfo || (paymentInfo && !paymentInfo.length)) {
        next({ message: 'Información de pago incorrecta' });
        return;
    }

    const payment_info_schema = map_payment_info_to_database_schema(paymentInfo);
    console.log(payment_info_schema);

    try {
        const response = await prisma.sale.update({
            where: { id: Number(id) },
            data: { payment: { create: payment_info_schema } },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    CREATE_PAYMENT_FOR_SALE,
};
