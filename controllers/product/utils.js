const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.setImagePath = (variantsWithImage, product_variant, req) => {
  let counter = 0;
  const variants = product_variant.map((databaseVariant, index) => {
    if (variantsWithImage[index] != null && typeof variantsWithImage[index] !== 'string') {
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
