const prisma = require('../../prisma');

const filterHandler = require('./filter');

const fetch_currency_rates = async (queryFilters = {}) => {
    const records = await prisma.currency_rate.findMany({ ...queryFilters });
    const rates_object = records.reduce(
        (acc, record) => ((acc[record.currency] = { id: record.id, value: Number(record.value), rounding: record.rounding }), acc),
        {}
    );

    return {
        current_currency_rates_object: rates_object,
        current_currency_rates_array: records,
    };
};

const GET_CURRENCY_RATES = async (req, res, next) => {
    let { filter } = req.query;

    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }

    try {
        const { current_currency_rates_object } = await fetch_currency_rates(queryFilters);

        res.status(200).json(current_currency_rates_object);
    } catch (error) {
        next(error);
    }
};

const GET_CURRENCY_RATE = async (req, res, next) => {
    const { currencySymbol } = req.params;

    try {
        const currencyRate = await prisma.currency_rate.findUnique({
            where: { currency: currencySymbol },
        });
        if (currencyRate) {
            res.status(200).json(currencyRate);
        } else {
            res.status(404).json({ error: { message: 'Currency not found' } });
        }
    } catch (error) {
        next(error);
    }
};

const CREATE_CURRENCY_RATE = async (req, res, next) => {
    const { currency, value, rounding } = req.body;

    try {
        const response = await prisma.currency_rate.create({
            data: { currency, value, rounding },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const UPDATE_CURRENCY_RATE = async (req, res, next) => {
    const { id } = req.params;
    const { currency, value, rounding } = req.body;

    try {
        const response = await prisma.currency_rate.update({
            where: { id: parseInt(id) },
            data: { currency, value, rounding },
        });
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const DELETE_CURRENCY_RATE = async (req, res, next) => {
    const { id } = req.params;
    try {
        if (![0, 1, 2].includes(parseInt(id))) {
            const response = await prisma.currency_rate.delete({
                where: { id: parseInt(id) },
            });
            res.status(200).json(response);
        } else {
            res.status(422).json({ error: { message: 'No se puede eliminar esta moneda del sistema' } });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_CURRENCY_RATES,
    GET_CURRENCY_RATE,
    CREATE_CURRENCY_RATE,
    UPDATE_CURRENCY_RATE,
    DELETE_CURRENCY_RATE,
    fetch_currency_rates,
};
