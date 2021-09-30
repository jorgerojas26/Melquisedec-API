const prisma = require('../../prisma');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_SUPPLYINGS = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.supplying,
            queryFilters,
            paginationConfig: req.paginationConfig,
            include: { product_variant: { include: { product: true } }, supplier: true },
        });
        const response = { records: [...records], recordsTotal, pageCount };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_SUPPLYING = async (req, res, next) => {
    const { product_variant_id, supplierId, buyPrice, quantity } = req.body;

    try {
        const response = await prisma.supplying.create({
            data: {
                product_variant_id,
                supplierId,
                buyPrice,
                quantity,
            },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_SUPPLYING = async (req, res, next) => {
    const { id } = req.params;
    const { product_variant_id, supplierId, buyPrice, quantity } = req.body;

    try {
        const response = await prisma.supplying.update({
            where: { id: Number(id) },
            data: { product_variant_id, supplierId, buyPrice, quantity },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_SUPPLYING = async (req, res, next) => {
    /*
  const { id } = req.params;

  try {
    let response = await prisma.supplying.delete({ where: { id: parseInt(id) } });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
  */
    res.status(401).json({
        error: {
            message: 'No se puede eliminar un abastecimiento',
        },
    });
};

module.exports = {
    GET_SUPPLYINGS,
    CREATE_SUPPLYING,
    UPDATE_SUPPLYING,
    DELETE_SUPPLYING,
};
