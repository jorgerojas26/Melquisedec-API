const router = require('express').Router();

const controller = require('../controllers/paymentMethod');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const paymentMethodSchema = require('../dataSchema/paymentMethod');

router.route('/').get(paginate, controller.GET_PAYMENT_METHODS).post(validateBody(paymentMethodSchema), controller.CREATE_PAYMENT_METHOD);

router.route('/:id').patch(validateBody(paymentMethodSchema), controller.UPDATE_PAYMENT_METHOD).delete(controller.DELETE_PAYMENT_METHOD);

module.exports = router;
