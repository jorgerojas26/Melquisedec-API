const users = require('../../mocks/users.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const createUsers = async () => {
    for (let user of users) {
        user.password = await bcrypt.hash(user.password, 10);
        await prisma.user.create({
            data: user,
        });
    }
};

module.exports = createUsers;
