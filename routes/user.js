const router = require('express').Router();

const controller = require('../controllers/user');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const userSchema = require('../dataSchema/user');

router.route('/').get(paginate, controller.GET_USERS).post(validateBody(userSchema), controller.CREATE_USER);

router.route('/:id').patch(validateBody(userSchema), controller.UPDATE_USER).delete(controller.DELETE_USER);

module.exports = router;
