const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {
    setImagePath,
    productExists,
    variantsToBeDeleted,
    setCRUDAction,
    compareNewStockWithDatabase,
    sanitizeVariants,
} = require('./utils');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { SET_ALL_CURRENCY_PRICES } = require('../../utils/product');

const GET_PRODUCTS = async (req, res, next) => {
    let { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        const currencyRates = await prisma.currency_rate.findMany();

        let { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.product,
            queryFilters,
            paginationConfig: req.paginationConfig,
            include: { product_variant: true },
        });

        records = SET_ALL_CURRENCY_PRICES({ products: records.product_variant, currencyRates });

        const response = { records: [...records], recordsTotal, pageCount };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_PRODUCT = async (req, res, next) => {
    const { id } = req.params;

    try {
        const response = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { product_variant: true },
        });
        res.json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_PRODUCT = async (req, res, next) => {
    let { name, brand, variantsWithImage, product_variant } = req.body;
    product_variant = JSON.parse(product_variant);
    variantsWithImage = JSON.parse(variantsWithImage);
    product_variant = setImagePath(variantsWithImage, product_variant, req);

    try {
        const response = await prisma.product.create({
            data: { name, brand, product_variant: { create: product_variant } },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_PRODUCT = async (req, res, next) => {
    let { id } = req.params;
    id = parseInt(id);

    let { name, brand, variantsWithImage, product_variant, reasons } = req.body;
    console.log(req.body);
    product_variant = JSON.parse(product_variant);
    variantsWithImage = JSON.parse(variantsWithImage);
    product_variant = setImagePath(variantsWithImage, product_variant, req);
    product_variant = sanitizeVariants(product_variant);

    try {
        const product_from_database = await productExists(id); //checking if product exists
        if (!product_from_database) {
            res.status(404).json({ error: { message: 'Este producto no existe' } });
        } else {
            //if product exists then check if the sum of the new stock value for this product (all variants) is greater than the sum of the ones in database
            const { databaseStock, requestStock } = compareNewStockWithDatabase(product_from_database.product_variant, product_variant);

            if (requestStock > databaseStock) {
                res.status(422).json({ error: { message: 'El stock total no puede ser mayor que el actual', path: 'stockLimit' } });
                return;
            } else if (requestStock < databaseStock) {
                if (!reasons || reasons == 'undefined' || reasons == 'null' || reasons == '') {
                    res.status(422).json({
                        error: { message: 'Para rebajar el stock de un producto, debe proveer las razones', path: 'stockLimit' },
                    });
                    return;
                } else {
                    for (const variant of product_variant) {
                        for (const db_variant of product_from_database.product_variant) {
                            if (variant.id === db_variant.id && variant.stock < db_variant.stock) {
                                await prisma.arbitrary_stock_change.create({
                                    data: {
                                        product_variant_id: db_variant.id,
                                        old_stock: db_variant.stock,
                                        new_stock: variant.stock,
                                        reasons,
                                    },
                                });
                            }
                        }
                    }
                }
            }

            const allVariants = variantsToBeDeleted(product_from_database.product_variant, product_variant); // set a flag for any variant deleted by the user

            let response = null;
            for (const variant of allVariants) {
                const crudAction = setCRUDAction(variant); // set the crud action of this variant (new variant = create, deleted variant = delete, updated variant = update)
                delete variant.profitPercent; // Delete profit percent because this is auto calculated by database triggers
                response = await prisma.product.update({
                    where: { id },
                    data: { name, brand, product_variant: { ...crudAction } },
                });
            }
            res.status(200).json(response);
        }
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
    res.json({ error: { message: 'No puedes eliminar un producto', path: null } });
};

module.exports = {
    GET_PRODUCTS,
    GET_PRODUCT,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
};
