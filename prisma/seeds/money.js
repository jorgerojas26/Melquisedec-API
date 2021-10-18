const money = require('../../mocks/money');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMoney = async () => {
    for (let m of money) {
        await prisma.money.create({
            data: m,
        });
    }
};

module.exports = createMoney;
