const router = require('express').Router();

const controller = require('../controllers/client');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const clientSchema = require('../dataSchema/client');

router.route('/').get(paginate, controller.GET_CLIENTS).post(validateBody(clientSchema), controller.CREATE_CLIENT);

router.route('/:id').patch(validateBody(clientSchema), controller.UPDATE_CLIENT).delete(controller.DELETE_CLIENT);

module.exports = router;
