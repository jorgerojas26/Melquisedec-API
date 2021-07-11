const router = require('express').Router();

const controller = require('../controllers/user');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const saleSchema = require('../dataSchema/sale');

router.route('/').get(paginate, controller.GET_SALES).post(validateBody(saleSchema), controller.CREATE_SALE);

router.route('/:id').patch(validateBody(saleSchema), controller.UPDATE_SALE).delete(controller.DELETE_SALE);

module.exports = router;
