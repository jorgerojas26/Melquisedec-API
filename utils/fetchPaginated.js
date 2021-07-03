exports.GET_PAGINATED_RESOURCE = async ({ model, queryFilters, paginationConfig, include, select }) => {
  let { skip, take } = paginationConfig;

  let recordsTotal = await model.count(queryFilters);
  if (recordsTotal < take) skip = 0;

  const records = await model.findMany({
    ...queryFilters,
    skip,
    take,
    orderBy: { id: 'desc' },
    include,
    select,
  });

  const pageCount = Math.ceil(recordsTotal / take);

  return {
    records,
    recordsTotal,
    pageCount,
  };
};
