const categories = require('../../mocks/categories');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCategories = async () => {
    for (let category of categories) {
        await prisma.category.create({
            data: category,
        });
    }
};

module.exports = createCategories;
