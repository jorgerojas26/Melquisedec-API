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
        currency: { contains: filter },
      },
    ],
  };

  return condition;
};

module.exports = filterHandler;
