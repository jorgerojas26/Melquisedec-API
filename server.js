require('dotenv').config();

const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');

const client_routes = require('./routes/client');
const user_routes = require('./routes/user');
const supplier_routes = require('./routes/supplier');
const category_routes = require('./routes/category');
const product_routes = require('./routes/product');
const product_variant_routes = require('./routes/product_variant');
const currencyRate_routes = require('./routes/currencyRate');
const supplying_routes = require('./routes/supplying');
const sale_routes = require('./routes/sale');
const payment_method_routes = require('./routes/paymentMethod');
const debt_routes = require('./routes/debt');
const report_routes = require('./routes/report');
const payment_routes = require('./routes/payment');
const inventory_routes = require('./routes/inventory');
const money_routes = require('./routes/money');

const errorMiddleware = require('./middlewares/errorMiddleware');

require('./prisma/middlewares');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, path.join(__dirname, 'client', 'build', 'productImages'));
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});
var upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join('client', 'build')));

//routes
app.use('/api/clients', client_routes);
app.use('/api/users', user_routes);
app.use('/api/suppliers', supplier_routes);
app.use('/api/categories', category_routes);
app.use('/api/products', upload.array('images', 100), product_routes);
app.use('/api/product_variants', product_variant_routes);
app.use('/api/currencyRates', currencyRate_routes);
app.use('/api/supplyings', supplying_routes);
app.use('/api/sales', sale_routes);
app.use('/api/payment-methods', payment_method_routes);
app.use('/api/debts', debt_routes);
app.use('/api/reports', report_routes);
app.use('/api/payments', payment_routes);
app.use('/api/inventory', inventory_routes);
app.use('/api/money', money_routes);

app.use(errorMiddleware);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/*', function (request, response) {
    response.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
});
app.listen(process.env.PORT || 5000, () => {
    console.log('Server running in port: ' + process.env.PORT || 5000);
});
