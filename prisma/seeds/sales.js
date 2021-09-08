const sales = require('../../mocks/sale.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createSales = async () => {
    for (let sale of sales) {
        await prisma.sale.create({
            data: sale,
        });
    }
};

module.exports = createSales;
