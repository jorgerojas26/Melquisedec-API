const router = require('express').Router();

const controller = require('../controllers/product');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const productSchema = require('../dataSchema/product');

router.route('/').get(paginate, controller.GET_PRODUCTS).post(controller.CREATE_PRODUCT);

router.route('/:id').get(controller.GET_PRODUCT).patch(controller.UPDATE_PRODUCT).delete(controller.DELETE_PRODUCT);

module.exports = router;
