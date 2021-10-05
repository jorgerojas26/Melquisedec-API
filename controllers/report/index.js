const prisma = require('../../prisma');

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
            CONCAT(product.name, ' ', product.brand, ' ',  product_variant.name) as product,
            SUM(sale_product.quantity) as quantity,
            ROUND(SUM(sale_product.price * sale_product.quantity), 4) as rawProfitUSD,
            ROUND(SUM(sale_product.price * sale_product.quantity * price_currency_rate.value), 4) as rawProfitVES,
            ROUND(SUM(sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity), 4) as netProfitUSD,
            SUM((sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity) * price_currency_rate.value) as netProfitVES
            FROM
            sale
            INNER JOIN sale_product ON sale_product.saleId = sale.id
            INNER JOIN product_variant ON product_variant.id = sale_product.product_variant_id
            INNER JOIN product on product.id = product_variant.productId
            INNER JOIN sale_currency_rate as payment_currency_rate ON payment_currency_rate.saleId = sale.id AND payment_currency_rate.currency = 'PAYMENT_VES'
            INNER JOIN sale_currency_rate as price_currency_rate ON price_currency_rate.saleId = sale.id AND price_currency_rate.currency = 'PRICE_VES'
            WHERE DATE(sale.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY product_variant.id
        `;

        const top_sell_products = await prisma.$queryRaw`
            SELECT
            CONCAT(product.name, ' ', product.brand, ' ',  product_variant.name) as product,
            SUM(sale_product.quantity) as totalSold
            FROM
            sale
            INNER JOIN sale_product ON sale_product.saleId = sale.id
            INNER JOIN product_variant ON product_variant.id = sale_product.product_variant_id
            INNER JOIN product on product.id = product_variant.productId
            WHERE DATE(sale.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY product_variant.id
            ORDER BY totalSold ASC
            LIMIT 10
        `;

        const payment_report = await prisma.$queryRaw`
            SELECT
            payment_method.name,
            ROUND(SUM(payment.amount), 2) as amount,
            COUNT(payment.id) as usedCount,
            payment.currency
            FROM
            payment
            INNER JOIN payment_method ON payment_method.id = payment.payment_method_id
            WHERE DATE(payment.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY payment.payment_method_id, payment.currency
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
            debt.current_amount
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
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SALE_REPORT,
};
