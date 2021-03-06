const createUsers = require('./seeds/users');
const createClients = require('./seeds/clients');
const createCategories = require('./seeds/categories');
const createCurrencyRates = require('./seeds/currencyRate');
const createProducts = require('./seeds/products');
const createSales = require('./seeds/sales');
const createPaymentMethods = require('./seeds/payment_methods');
const createMoney = require('./seeds/money');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await createMoney();
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
