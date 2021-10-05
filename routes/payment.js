const router = require('express').Router();

const controller = require('../controllers/payment');

const paymentSchema = require('../dataSchema/payment');

router.route('/sale/:id').post(controller.CREATE_PAYMENT_FOR_SALE);

module.exports = router;
