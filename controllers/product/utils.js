const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { CALCULATE_PROFIT_PERCENT } = require('../../utils/product');

exports.setImagePath = (variantsWithImage, product_variant, req) => {
    let counter = 0;
    const variants = product_variant.map((databaseVariant, index) => {
        if (variantsWithImage[index] != -1 && typeof variantsWithImage[index] !== 'string') {
            databaseVariant.imagePath = `\\productImages\\${req.files[index - counter].filename}`;
        } else {
            counter++;
        }
        return databaseVariant;
    });
    return variants;
};

exports.productExists = async (id) => {
    let product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
            product_variant: true,
        },
    });

    return product;
};

exports.variantsToBeDeleted = (databaseProductVariants, variantsFromRequest) => {
    let allVariants = [...variantsFromRequest];

    databaseProductVariants.map((databaseVariant) => {
        let found = false;
        variantsFromRequest.map((receivedVariantFromRequest) => {
            if (databaseVariant.id === receivedVariantFromRequest.id) {
                found = true;
            }
        });

        if (!found) {
            allVariants.push({
                ...databaseVariant,
                markedToBeDeleted: true,
            });
        }
    });
    return allVariants;
};

exports.setCRUDAction = (variant) => {
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
    return {
        ...create,
        ...update,
        ...del,
    };
};

exports.compareNewStockWithDatabase = (variantsFromDatabase, variantsFromRequest) => {
    let databaseStock = 0;
    let requestStock = 0;

    variantsFromDatabase.map((variant) => {
        if (variant.stock) databaseStock += variant.stock * variant.unitValue;
    });

    variantsFromRequest.map((variant) => {
        if (variant.stock) requestStock += variant.stock * variant.unitValue;
    });

    return {
        databaseStock,
        requestStock,
    };
};

exports.recalculateProfitPercent = (variantFromRequest, lastSupplying) => {
    const price = variantFromRequest.price;
    const buyPrice = parseFloat(lastSupplying.buyPrice);
    const newProfitPercent = CALCULATE_PROFIT_PERCENT(price, buyPrice);

    return newProfitPercent !== null ? newProfitPercent : variantFromRequest.profitPercent;
};

exports.sanitizeVariants = (variantsArray) => {
    if (variantsArray) {
        return variantsArray.map((variant) => {
            return {
                id: variant.id,
                productId: variant.productId,
                name: variant.name,
                price: variant.price,
                unitValue: variant.unitValue,
                stock: variant.stock,
                imagePath: variant.imagePath,
            };
        });
    }
    return [];
};
