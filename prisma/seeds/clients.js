const clients = require('../../mocks/clients');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createClients = async () => {
    for (let client of clients) {
        await prisma.client.create({
            data: client,
        });
    }
};

module.exports = createClients;
