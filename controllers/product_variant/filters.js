const filterHandler = (filter) => {
  let condition = {};

  let idFilter = {};
  let priceFilter = {};

  if (!isNaN(filter)) {
    idFilter = {
      id: {
        equals: parseInt(filter),
      },
    };
    priceFilter = {
      price: {
        equals: parseFloat(filter),
      },
    };
  }

  condition = {
    OR: [
      idFilter,
      {
        name: { contains: filter },
      },
      priceFilter,
      {
        product: {
          OR: [idFilter, { name: { contains: filter } }, { brand: { contains: filter } }],
        },
      },
    ],
  };

  return condition;
};

module.exports = filterHandler;
