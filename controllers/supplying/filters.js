const filterHandler = (filter) => {
  let condition = {};

  let idFilter = {};

  if (!isNaN(filter)) {
    idFilter = {
      id: {
        equals: parseInt(filter),
      },
    };
  }

  condition = {
    OR: [
      idFilter,
      {
        product_variant: {
          OR: [
            { name: { contains: filter } },
            {
              product: {
                OR: [{ name: { contains: filter } }, { brand: { contains: filter } }],
              },
            },
          ],
        },
      },
      { supplier: { name: { contains: filter } } },
    ],
  };

  return condition;
};

module.exports = filterHandler;
