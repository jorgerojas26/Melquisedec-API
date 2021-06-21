const currencyRates = require("../../mocks/currencyRate.js");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCurrencyRate = async () => {
  for (let currencyRate of currencyRates) {
    await prisma.currencyRate.create({
      data: currencyRate,
    });
  }
};

module.exports = createCurrencyRate;
