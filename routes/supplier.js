const router = require('express').Router();

const controller = require('../controllers/supplier');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const supplierSchema = require('../dataSchema/supplier');

router.route('/').get(paginate, controller.GET_SUPPLIERS).post(validateBody(supplierSchema), controller.CREATE_SUPPLIER);

router.route('/:id').patch(validateBody(supplierSchema), controller.UPDATE_SUPPLIER).delete(controller.DELETE_SUPPLIER);

module.exports = router;
