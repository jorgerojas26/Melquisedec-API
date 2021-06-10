const router = require('express').Router();

const controller = require('../controllers/category');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const categorySchema = require('../dataSchema/category');

router.route('/').get(paginate, controller.GET_CATEGORIES).post(validateBody(categorySchema), controller.CREATE_CATEGORY);

router.route('/:id').patch(validateBody(categorySchema), controller.UPDATE_CATEGORY).delete(controller.DELETE_CATEGORY);

module.exports = router;
