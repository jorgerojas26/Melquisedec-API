const createUsers = require('./seeds/users');
const createClients = require('./seeds/clients');
const createCategories = require('./seeds/categories');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await createUsers();
    await createClients();
    await createCategories();

    await prisma.$queryRaw("insert into client values(null, 'Ramon castro', '25664799', '04124192604', null)");
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
