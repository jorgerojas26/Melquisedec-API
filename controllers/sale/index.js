const prisma = require('../../prisma');

const filterHandler = require('./filters');
const { GET_PAGINATED_RESOURCE } = require('../../utils/fetchPaginated');
const { SET_ALL_CURRENCY_PRICES, CONVERT_AMOUNT_TO_CURRENCY_RATE } = require('../../utils/product');
const {
    calculate_payment_total,
    calculate_sale_total,
    get_higher_payment,
    map_payment_info_to_database_schema,
    map_products_to_database_schema,
    calculate_paying_debt_total,
    validate_product_info,
} = require('./utils');
const { fetch_product_variants_in } = require('../product_variant');
const { fetch_currency_rates } = require('../currencyRate');

const GET_SALES = async (req, res, next) => {
    const { filter } = req.query;
    let queryFilters = {};

    if (filter) {
        queryFilters.where = filterHandler(filter);
    }
    try {
        const { records, recordsTotal, pageCount } = await GET_PAGINATED_RESOURCE({
            model: prisma.sale,
            queryFilters,
            paginationConfig: req.paginationConfig,
            include: {
                products: {
                    include: { product_variant: { include: { product: true } } },
                },
                debt: true,
                payment: { include: { payment_method: true } },
                client: true,
            },
        });

        const response = {
            records: [...records],
            recordsTotal,
            pageCount,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const CREATE_SALE = async (req, res, next) => {
    let { clientId, products, paymentInfo, saveAsDebt, status, paying_debts } = req.body;

    try {
        const databaseProducts = await fetch_product_variants_in(products.map((product) => product.id));

        const product_validation = validate_product_info(databaseProducts, products);
        if (product_validation.error) {
            next(product_validation.error);
            return;
        }

        const { current_currency_rates_object } = await fetch_currency_rates();

        const sale_products_schema = map_products_to_database_schema(databaseProducts, products);

        const payment_info_schema = map_payment_info_to_database_schema(paymentInfo);

        const sale_total_VES = calculate_sale_total(
            sale_products_schema,
            current_currency_rates_object['PRICE_VES'].value,
            current_currency_rates_object['PRICE_VES'].rounding
        );
        const sale_total_USD = sale_total_VES / current_currency_rates_object['PAYMENT_VES'].value;

        const payment_total_VES = calculate_payment_total(payment_info_schema, current_currency_rates_object);
        const payment_total_USD = payment_total_VES / current_currency_rates_object['PAYMENT_VES'].value;

        const difference_USD = sale_total_USD - payment_total_USD;

        console.log('Sale Total USD: ', sale_total_USD);
        console.log('Sale total VES: ', sale_total_VES);

        console.log('Payment Total USD: ', payment_total_USD);
        console.log('Payment total VES: ', payment_total_VES);

        let paying_debt_total = 0;
        if (paying_debts.length) {
            const database_debts = await prisma.sale.findMany({
                where: { id: { in: paying_debts } },
                include: { debt: true, payment: true, currencyRates: true, products: true },
            });

            paying_debt_total = calculate_paying_debt_total(database_debts);
            console.log('Paying debt total: ', paying_debt_total);

            const higher_payment = get_higher_payment(payment_info_schema, current_currency_rates);
        }

        const client = clientId ? { client: { connect: { id: clientId } } } : {};
        let data = {
            ...client,
            products: { create: sale_products_schema },
            totalAmount: sale_total_VES / current_currency_rates_object['PAYMENT_VES'].value,
            status,
            payment: { create: payment_info_schema },
        };

        if (sale_total_VES !== payment_total_VES && saveAsDebt) {
            if (!clientId) {
                next({ message: 'Debe seleccionar un cliente para guardar la deuda', statusCode: 422 });
                return;
            } else {
                data = { ...data, debt: { create: { original_amount: difference_USD, current_amount: difference_USD } } };
            }
        }
        const response = await prisma.sale.create({ data });
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const DELETE_SALE = async (req, res, next) => {
    const { id } = req.params;

    try {
        let sale = await prisma.sale.findUnique({ where: { id: parseInt(id) }, include: { products: true } });
        if (sale) {
            let response = await prisma.sale.update({
                where: { id: parseInt(id) },
                data: { status: 0 },
            });
            res.status(201).json(response);
        } else {
            res.status(404).json({ error: { message: 'Venta no encontrada' } });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SALES,
    CREATE_SALE,
    DELETE_SALE,
};
