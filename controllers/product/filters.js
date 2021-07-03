const filterHandler = (filter) => {
  let condition = {};

  let idFilter = {};
  let priceFilter = {};
  let profitPercentFilter = {};
  let unitValueFilter = {};
  let stockFilter = {};

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
        name: { contains: filter },
      },
      {
        brand: { contains: filter },
      },
    ],
  };

  return condition;
};

module.exports = filterHandler;
