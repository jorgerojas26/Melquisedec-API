const router = require('express').Router();

const controller = require('../controllers/payment');
const validateBody = require('../middlewares/validateBody');

const paymentSchema = require('../dataSchema/payment');

router.route('/sale/:id').post(validateBody(paymentSchema), controller.CREATE_PAYMENT_FOR_SALE);

module.exports = router;
