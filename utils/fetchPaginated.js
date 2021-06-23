const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.GET_PAGINATED_RESOURCE = async ({ model, queryFilters, paginationConfig, include }) => {
  let { skip, take } = paginationConfig;

  let recordsTotal = await model.count(queryFilters);
  if (recordsTotal < take) skip = 0;

  const records = await model.findMany({
    ...queryFilters,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
    include,
  });

  const pageCount = Math.ceil(recordsTotal / take);

  return {
    records,
    recordsTotal,
    pageCount,
  };
};
