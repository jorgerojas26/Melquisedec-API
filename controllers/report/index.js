const prisma = require('../../prisma');

const MONTHS = {
    Enero: 1,
    Febrero: 2,
    Marzo: 3,
    Abril: 4,
    Mayo: 5,
    Junio: 6,
    Julio: 7,
    Agosto: 8,
    Septiembre: 9,
    Octubre: 10,
    Noviembre: 11,
    Diciembre: 12,
};

const GET_SALE_REPORT = async (req, res, next) => {
    let { from, to } = req.query;
    from = new Date(from);
    to = new Date(to);

    try {
        if (from.toString() === 'Invalid Date' || to.toString() === 'Invalid Date') {
            next({ message: 'El formato de fechas es incorrecto' });
            return;
        }

        const sale_report = await prisma.$queryRaw`
            SELECT 
            product_variant.id,
            product_variant.name as product,
            ROUND(SUM(sale_product.quantity), 3) as quantity,
            ROUND(SUM(sale_product.price * sale_product.quantity), 4) as rawProfitUSD,
            ROUND(SUM(sale_product.price * sale_product.quantity * price_currency_rate.value), 2) as rawProfitVES,
            ROUND(SUM(sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity), 4) as netProfitUSD,
            ROUND(SUM((sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity) * price_currency_rate.value), 2) as netProfitVES
            FROM
            sale
            INNER JOIN sale_product ON sale_product.saleId = sale.id
            INNER JOIN product_variant ON product_variant.id = sale_product.product_variant_id
            INNER JOIN product on product.id = product_variant.productId
            INNER JOIN sale_currency_rate as payment_currency_rate ON payment_currency_rate.saleId = sale.id AND payment_currency_rate.currency = 'PAYMENT_VES'
            INNER JOIN sale_currency_rate as price_currency_rate ON price_currency_rate.saleId = sale.id AND price_currency_rate.currency = 'PRICE_VES'
            WHERE DATE(sale.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY product_variant.id
            ORDER BY netProfitUSD DESC
        `;

        const top_sell_products = await prisma.$queryRaw`
            SELECT
            product_variant.name as product,
            SUM(sale_product.quantity) as totalSold
            FROM
            sale
            INNER JOIN sale_product ON sale_product.saleId = sale.id
            INNER JOIN product_variant ON product_variant.id = sale_product.product_variant_id
            INNER JOIN product on product.id = product_variant.productId
            WHERE DATE(sale.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY product_variant.id
            ORDER BY totalSold DESC
            LIMIT 5
        `;

        const payment_report = await prisma.$queryRaw`
            SELECT
            CASE WHEN payment_method.name = 'Cash' THEN 'Efectivo' ELSE payment_method.name END as name,
            ROUND(SUM(payment.amount), 2) as amount,
            COUNT(payment.id) as usedCount,
            payment.currency
            FROM
            payment
            INNER JOIN payment_method ON payment_method.id = payment.payment_method_id
            INNER JOIN sale ON sale.id = payment.sale_id AND sale.status = 1
            WHERE DATE(payment.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY payment.payment_method_id, payment.currency
        `;

        const debt_payment_report = await prisma.$queryRaw`
            SELECT
            debt.id,
            client.name,
            client.cedula,
            ROUND(CASE WHEN payment.currency = 'USD' THEN payment.amount WHEN payment.currency = 'VES' THEN payment.amount / sale_currency_rate.value END, 2) as amount_USD,
            ROUND(CASE WHEN payment.currency = 'USD' THEN payment.amount *  sale_currency_rate.value WHEN payment.currency = 'VES' THEN payment.amount END, 2) as amount_VES,
            payment.currency,
            payment.createdAt
            FROM
            payment
            INNER JOIN sale ON sale.id = payment.sale_id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            INNER JOIN client ON client.id = sale.clientId
            LEFT JOIN debt ON debt.saleId = sale.id
            WHERE DATE(payment.createdAt) BETWEEN ${from} AND ${to}
            AND payment.createdAt > debt.createdAt
        `;

        const hourly_sales_report = await prisma.$queryRaw`
            WITH RECURSIVE seq AS (SELECT 0 AS value UNION ALL SELECT value + 1 FROM seq WHERE value < 23) 
            SELECT 
            seq.value as hour,
            COUNT(sale.id) as total
            FROM seq
            LEFT JOIN 
            sale
            ON DATE(sale.createdAt) BETWEEN ${from} AND ${to}
            AND HOUR(sale.createdAt) = seq.value
            GROUP BY seq.value
        `;

        const debt_report = await prisma.$queryRaw`
            SELECT
            sale.id as saleId,
            client.*,
            debt.original_amount,
            debt.current_amount,
            debt.createdAt,
            debt.paid_date
            FROM
            debt
            INNER JOIN sale ON sale.id = debt.saleId
            INNER JOIN client ON client.id = sale.clientId
            WHERE DATE(debt.createdAt) BETWEEN ${from} AND ${to}
        `;

        const response = {
            sale_report,
            payment_report,
            debt_report,
            top_sell_products,
            hourly_sales_report,
            debt_payment_report,
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_TOP_CLIENTS = async (req, res, next) => {
    try {
        const sale_lifetime = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(sale.totalAmount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const sale_last_month = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(sale.totalAmount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(sale.createdAt) BETWEEN CURRENT_DATE() - INTERVAL 30 DAY AND CURRENT_DATE()
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5

        `;

        const sale_last_week = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(sale.totalAmount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(sale.createdAt) BETWEEN CURRENT_DATE() - INTERVAL 7 DAY AND CURRENT_DATE()
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const sale_today = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(sale.totalAmount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(sale.createdAt) BETWEEN CURRENT_DATE() AND CURRENT_DATE() + INTERVAL 1 DAY
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const debt_lifetime = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(debt.original_amount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN debt ON debt.saleId = sale.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const debt_last_month = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(debt.original_amount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN debt ON debt.saleId = sale.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(debt.createdAt) BETWEEN CURRENT_DATE() - INTERVAL 30 DAY AND CURRENT_DATE()
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const debt_last_week = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(debt.original_amount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN debt ON debt.saleId = sale.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(debt.createdAt) BETWEEN CURRENT_DATE() - INTERVAL 7 DAY AND CURRENT_DATE()
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const debt_today = await prisma.$queryRaw`
            SELECT 
            client.id,
            client.name,
            client.cedula,
            ROUND(SUM(debt.original_amount), 2) as total
            FROM
            client
            INNER JOIN sale ON sale.clientId = client.id
            INNER JOIN debt ON debt.saleId = sale.id
            INNER JOIN sale_currency_rate ON sale_currency_rate.saleId = sale.id AND sale_currency_rate.currency = 'PAYMENT_VES'
            WHERE DATE(debt.createdAt) BETWEEN CURRENT_DATE() AND CURRENT_DATE() + INTERVAL 1 DAY
            GROUP BY client.id
            ORDER BY total DESC
            LIMIT 5
        `;

        const response = {
            sales: {
                lifetime: sale_lifetime,
                last_month: sale_last_month,
                last_week: sale_last_week,
                today: sale_today,
            },
            debts: {
                lifetime: debt_lifetime,
                last_month: debt_last_month,
                last_week: debt_last_week,
                today: debt_today,
            },
        };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_PRODUCT_COST_FLUCTUATION = async (req, res, next) => {
    const { productId } = req.params;

    try {
        let response = await prisma.$queryRaw`
            SELECT
               product_variant.name as product,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 1, supplying.buyPrice, NULL)), 2)  AS Enero,
               COUNT(IF(MONTH(supplying.createdAt) = 1, supplying.id, NULL))  AS Enero_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 2, supplying.buyPrice, NULL)), 2)  AS Febrero,
               COUNT(IF(MONTH(supplying.createdAt) = 2, supplying.id, NULL))  AS Febrero_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 3, supplying.buyPrice, NULL)), 2)  AS Marzo,
               COUNT(IF(MONTH(supplying.createdAt) = 3, supplying.id, NULL))  AS Marzo_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 4, supplying.buyPrice, NULL)), 2)  AS Abril,
               COUNT(IF(MONTH(supplying.createdAt) = 4, supplying.id, NULL))  AS Abril_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 5, supplying.buyPrice, NULL)), 2)  AS Mayo,
               COUNT(IF(MONTH(supplying.createdAt) = 5, supplying.id, NULL))  AS Mayo_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 6, supplying.buyPrice, NULL)), 2)  AS Junio,
               COUNT(IF(MONTH(supplying.createdAt) = 6, supplying.id, NULL))  AS Junio_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 7, supplying.buyPrice, NULL)), 2)  AS Julio,
               COUNT(IF(MONTH(supplying.createdAt) = 7, supplying.id, NULL))  AS Julio_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 8, supplying.buyPrice, NULL)), 2)  AS Agosto,
               COUNT(IF(MONTH(supplying.createdAt) = 8, supplying.id, NULL))  AS Agosto_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 9, supplying.buyPrice, NULL)), 2) AS Septiembre,
               COUNT(IF(MONTH(supplying.createdAt) = 9, supplying.id, NULL))  AS Septiembre_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 10, supplying.buyPrice, NULL)), 2) AS Octubre,
               COUNT(IF(MONTH(supplying.createdAt) = 10, supplying.id, NULL))  AS Octubre_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 11, supplying.buyPrice, NULL)), 2) AS Noviembre,
               COUNT(IF(MONTH(supplying.createdAt) = 11, supplying.id, NULL))  AS Noviembre_transactions,
               ROUND(AVG(IF(MONTH(supplying.createdAt) = 12, supplying.buyPrice, NULL)), 2) AS Diciembre,
               COUNT(IF(MONTH(supplying.createdAt) = 12, supplying.id, NULL))  AS Diciembre_transactions
            FROM
            supplying
            INNER JOIN product_variant ON product_variant.id = supplying.product_variant_id
            WHERE YEAR(supplying.createdAt) = YEAR(CURRENT_DATE())
            AND supplying.product_variant_id = ${productId}
            GROUP BY supplying.id
        `;

        response = response.reduce(
            (acc, current) => ({
                id: current.product,
                data: Object.keys(MONTHS).map((month) => ({ x: MONTHS[month], y: current[month] }), []),
            }),
            {}
        );
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_PRODUCT_AVERAGE_SALES = async (req, res, next) => {
    const { productId } = req.params;

    try {
        const data = await prisma.$queryRaw`
            SELECT
            WEEK(sale.createdAt, 1) as week,
            SUM(sale_product.quantity) as quantity
            FROM
            sale
            INNER JOIN sale_product ON sale_product.saleId = sale.id
            INNER JOIN product_variant ON product_variant.id = sale_product.product_variant_id AND product_variant.id = ${productId}
            WHERE DATE(sale.createdAt) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 3 MONTH) AND CURRENT_DATE()
            GROUP BY WEEK(sale.createdAt, 1)
        `;

        let chart_data = {};

        if (data && data.length) {
            chart_data = {
                id: 'average_sales',
                data: data.map((d) => ({ x: d.week, y: d.quantity })),
            };
        }
        const response = { data, chart_data };
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

const GET_DAILY_SALES = async (req, res, next) => {
    try {
        const data = await prisma.$queryRaw`
            SELECT
            CONCAT(DAY(MIN(sale.createdAt)), '/', MONTH(MIN(sale.createdAt))) as date,
            ROUND(SUM(sale.totalAmount), 2) as total
            FROM
            sale
            WHERE DATE(sale.createdAt) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 2 WEEK) AND CURRENT_DATE()
            GROUP BY DAY(sale.createdAt)
        `;

        const chart_data = {
            id: 'sales',
            data: data.map((d) => ({ x: d.date, y: d.total })),
        };

        console.log(chart_data);
        const response = { data, chart_data };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SALE_REPORT,
    GET_TOP_CLIENTS,
    GET_PRODUCT_COST_FLUCTUATION,
    GET_PRODUCT_AVERAGE_SALES,
    GET_DAILY_SALES,
};
