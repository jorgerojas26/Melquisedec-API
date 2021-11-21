const router = require('express').Router();

const controller = require('../controllers/money');

const validateBody = require('../middlewares/validateBody');

const moneySchema = require('../dataSchema/money');
const money_update_schema = require('../dataSchema/money_update');

router.route('/').get(controller.GET_ALL_MONEY).post(validateBody(moneySchema), controller.CREATE_MONEY);
router.route('/history').get(controller.GET_MONEY_HISTORY);
router.route('/:moneyId').patch(validateBody(money_update_schema), controller.UPDATE_MONEY);
module.exports = router;
