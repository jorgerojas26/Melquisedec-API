const router = require('express').Router();

const controller = require('../controllers/supplying');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const supplyingSchema = require('../dataSchema/supplying');

router.route('/').get(paginate, controller.GET_SUPPLYINGS).post(validateBody(supplyingSchema), controller.CREATE_SUPPLYING);

router.route('/:id').patch(validateBody(supplyingSchema), controller.UPDATE_SUPPLYING).delete(controller.DELETE_SUPPLYING);

module.exports = router;
