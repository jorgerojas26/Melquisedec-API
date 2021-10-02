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
            SUM(sale.totalAmount) as totalUSD,
            SUM(sale.totalAmount * payment_currency_rate.value) as totalVES,
            SUM((sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity)) as rawProfitUSD,
            SUM((sale_product.price * (sale_product.profitPercent / 100) * sale_product.quantity) * price_currency_rate.value) as rawProfitVES
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

        const payment_report = await prisma.$queryRaw`
            SELECT
            payment_method.name,
            SUM(payment.amount) as amount,
            payment.currency
            FROM
            payment
            INNER JOIN payment_method ON payment_method.id = payment.payment_method_id
            WHERE DATE(payment.createdAt) BETWEEN ${from} AND ${to}
            GROUP BY payment.payment_method_id, payment.currency
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
        };

        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    GET_SALE_REPORT,
};
