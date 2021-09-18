const products = require('../../mocks/products');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProducts = async () => {
    for (let product of products) {
        await prisma.product.create({
            data: product,
        });
    }
};

module.exports = createProducts;
