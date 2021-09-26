const payment_methods = require('../../mocks/payment_methods');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPaymentMethods = async () => {
    for (let payment_method of payment_methods) {
        await prisma.payment_method.create({
            data: payment_method,
        });
    }
};

module.exports = createPaymentMethods;
