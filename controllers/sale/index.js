const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');
const { calculate_payment_total, validate_product_info } = require('./utils');
const { fetch_product_variants_in } = require('../product_variant');
const { fetch_currency_rates } = require('../currencyRate');
const { convertArrayToObject } = require('../../utils/array');

const GET_SALES = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.sale,
            queryFilters,
            paginationConfig: req.paginationConfig,
            include: {
                products: {
                    include: { product_variant: { include: { product: true } } },
                },
                debt: true,
                payment: true,
                client: true,
            },
        });

        const response = {
            records: [...records],
            recordsTotal,
            pageCount,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_SALE = async (req, res, next) => {
    let { clientId, products, paymentInfo, saveAsDebt, status, paying_debts } = req.body;

    try {
        let sale_total_USD = 0;
        let sale_total_VES = 0;

        const databaseProducts = await fetch_product_variants_in(products.map((product) => product.id));

        const currencyRates = await fetch_currency_rates();

        const product_validation = validate_product_info(databaseProducts, products);
        if (product_validation.error) {
            next(product_validation.error);
            return;
        }

        const payment_total_VES = calculate_payment_total(paymentInfo, currencyRates);

        const sale_products = databaseProducts.map((product) => {
            sale_total_USD += product.price;
            sale_total_VES += product.converted_price['SYSTEM_USD'];

            return {
                price: product.price,
                quantity: products.find((p) => p.id === product.id).quantity,
                profitPercent: product.profitPercent,
                product_variant: { connect: { id: product.id } },
            };
        });

        const difference_VES = sale_total_VES - payment_total_VES;
        const difference_USD = difference_VES / currencyRates['USD'].value;
        const client = clientId ? { client: { connect: { id: clientId } } } : {};

        const payment = paymentInfo.map((payment) => {
            return {
                payment_method: { connect: { id: Number(payment.payment_method_id) } },
                amount: payment.isChange ? -payment.amount : payment.amount,
                currency: payment.currency,
                transaction_code: payment.transaction_code || null,
                bank: payment.bank_id ? { connect: payment.bank_id } : undefined,
            };
        });

        if (paying_debts.length) {
            const database_debts = await prisma.sale.findMany({
                where: { id: { in: paying_debts } },
                include: { debt: true, payment: true, currencyRates: true },
            });

            database_debts.forEach((debt) => {
                const payments = debt.payment;
                const sale_currency_rates = convertArrayToObject(debt.currencyRates, 'currency');
                const debt_info = debt.debt;

                const payment_total_VES = calculate_payment_total(payments, sale_currency_rates);
                console.log(sale_currency_rates);
                console.log(payment_total_VES);
                res.json(payment_total_VES);
            });
            res.json(database_debts);
            console.log(database_debts);
        }

        /*
        let data = { ...client, products: { create: sale_products }, totalAmount: sale_total_USD, status, payment: { create: payment } };

        if (sale_total_VES !== payment_total_VES && saveAsDebt) {
            if (!clientId) {
                next({ message: 'Debe seleccionar un cliente para guardar la deuda', statusCode: 422 });
                return;
            } else {
                data = { ...data, debt: { create: { amount: difference_USD, paid: 0 } } };
            }
        }
        const response = await prisma.sale.create({ data });
        res.status(200).json(response);
    */
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const DELETE_SALE = async (req, res, next) => {
    const { id } = req.params;

    try {
        let sale = await prisma.sale.findUnique({ where: { id: parseInt(id) }, include: { products: true } });
        if (sale) {
            let response = await prisma.sale.update({
                where: { id: parseInt(id) },
                data: { status: 2 },
            });
            res.status(201).json(response);
        } else {
            res.status(404).json({ error: { message: 'Venta no encontrada' } });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SALES,
    CREATE_SALE,
    DELETE_SALE,
};
