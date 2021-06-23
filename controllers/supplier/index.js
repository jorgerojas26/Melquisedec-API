const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');

const GET_SUPPLIERS = async (req, res, next) => {
  let { filter } = req.query;
  let queryFilters = {};

  if (filter) {
    queryFilters.where = filterHandler(filter);
  }

  try {
    const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
      model: prisma.supplier,
      queryFilters,
      paginationConfig: req.paginationConfig,
    });
    const response = { records: [...records], recordsTotal, pageCount };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const CREATE_SUPPLIER = async (req, res, next) => {
  const { name, rif, address, phoneNumber } = req.body;

  try {
    const response = await prisma.supplier.create({ data: { name, rif, address, phoneNumber } });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const UPDATE_SUPPLIER = async (req, res, next) => {
  const { id } = req.params;
  const { name, rif, address, phoneNumber } = req.body;

  try {
    const response = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { name, rif, address, phoneNumber },
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const DELETE_SUPPLIER = async (req, res, next) => {
  const { id } = req.params;

  try {
    let response = await prisma.supplier.delete({ where: { id: parseInt(id) } });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  GET_SUPPLIERS,
  CREATE_SUPPLIER,
  UPDATE_SUPPLIER,
  DELETE_SUPPLIER,
};
