const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

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
    let { clientId, products, status, debts } = req.body;

    let saleTotal = 0;

    const databaseProducts = await prisma.product_variant.findMany({
        where: { id: { in: products.map((product) => product.id) } },
    });

    const saleProducts = databaseProducts.map((product) => {
        saleTotal += Number(product.price);

        return {
            price: product.price,
            quantity: products.find((p) => p.id === product.id).quantity,
            profitPercent: product.profitPercent,
            product_variant: { connect: { id: product.id } },
        };
    });

    const client = clientId ? { connect: { id: clientId } } : {};

    try {
        const response = await prisma.sale.create({
            data: {
                client,
                products: { create: saleProducts },
                totalAmount: saleTotal,
                status,
            },
        });

        res.status(200).json(response);
    } catch (error) {
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
