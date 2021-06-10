const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');

const GET_PRODUCTS = async (req, res, next) => {
    let { filter } = req.query;

    let queryFilters = {};

    let { skip, take } = req.paginationConfig;

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        var recordsTotal = await prisma.product.count(queryFilters);
        if (recordsTotal < take) skip = 0;

        var records = await prisma.product.findMany({
            skip,
            take,
            include: { product_variant: true, ...queryFilters },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        next(error);
    }

    let pageCount = Math.ceil(recordsTotal / take);

    const response = {
        records: [...records],
        recordsTotal,
        pageCount,
    };
    res.json(response);
};

const GET_PRODUCT = async (req, res, next) => {
    const { id } = req.params;

    try {
        var response = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { product_variant: true },
        });
        res.json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_PRODUCT = async (req, res, next) => {
    let { name, brand, product_variant } = req.body;
    name = brand != 'undefined' ? name + ' ' + brand : name;
    try {
        product_variant = JSON.parse(product_variant);
        product_variant = product_variant.map((variant, index) => {
            if (req.files[index]) {
                variant.imagePath = `\\productImages\\${req.files[index].filename}`;
            }
            return variant;
        });
        const response = await prisma.product.create({
            data: {
                name,
                product_variant: {
                    create: product_variant,
                },
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_PRODUCT = async (req, res, next) => {
    const { id } = req.params;
    let { name, brand, product_variant } = req.body;
    name = brand != 'undefined' ? name + ' ' + brand : name;
    product_variant = JSON.parse(product_variant);
    product_variant = product_variant.map((variant, index) => {
        if (req.files[index]) {
            variant.imagePath = `\\productImages\\${req.files[index].filename}`;
        } else {
            variant.imagePath = null;
        }
        return variant;
    });

    try {
        let product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                product_variant: true,
            },
        });

        product.product_variant.map((variant) => {
            let found = false;
            product_variant.map((receivedVariant) => {
                if (variant.id === receivedVariant.id) {
                    found = true;
                }
            });
            if (!found) {
                product_variant.push({
                    ...variant,
                    markedToBeDeleted: true,
                });
            }
        });

        let response = null;
        for (const variant of product_variant) {
            let create = {};
            let update = {};
            let del = {};

            if (variant.markedToBeDeleted) {
                del = {
                    delete: { id: variant.id },
                };
            } else if (variant.id == undefined) {
                create = {
                    create: variant,
                };
            } else {
                update = {
                    update: {
                        where: { id: parseInt(variant.id) },
                        data: variant,
                    },
                };
            }

            response = await prisma.product.update({
                where: { id: parseInt(id) },
                data: {
                    name,
                    product_variant: {
                        ...create,
                        ...update,
                        ...del,
                    },
                },
            });
        }
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_PRODUCT = async (req, res, next) => {
    //const { id } = req.params;
    /*
    try {
        let response = await prisma.product.delete({ where: { id: parseInt(id) } });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
    */
    res.json({
        error: {
            message: 'No puedes eliminar un producto',
            path: null,
        },
    });
};

module.exports = {
    GET_PRODUCTS,
    GET_PRODUCT,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
};
