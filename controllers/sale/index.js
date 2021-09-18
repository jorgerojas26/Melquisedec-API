const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');
const { calculate_payment_total, validate_product_info } = require('./utils');
const { fetch_product_variants_in } = require('../product_variant');
const { fetch_currency_rates } = require('../currencyRate');

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
    let { clientId, products, paymentInfo, saveAsDebt, status, debts } = req.body;

    try {
        let sale_total_USD = 0;
        let sale_total_VES = 0;

        const databaseProducts = await fetch_product_variants_in(products.map((product) => product.id));

        const currencyRates = await fetch_currency_rates();

        const product_validation = validate_product_info(databaseProducts, products, next);
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
        const client = clientId ? { connect: { id: clientId } } : {};

        if (sale_total_VES !== payment_total_VES && saveAsDebt) {
            if (!clientId) {
                next({ message: 'Debe seleccionar un cliente para guardar la deuda', statusCode: 422 });
                return;
            } else {
                const response = await prisma.sale.create({
                    data: {
                        client,
                        products: { create: sale_products },
                        totalAmount: sale_total_USD,
                        status,
                        debt: { create: { amount: difference_USD, paid: 0 } },
                    },
                });

                res.status(200).json(response);
            }
        }
    } catch (error) {
        console.log(error);
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
