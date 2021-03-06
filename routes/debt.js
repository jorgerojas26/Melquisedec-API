const router = require('express').Router();

const controller = require('../controllers/debt');

const paginate = require('../middlewares/paginate');

router.route('/').get(paginate, controller.GET_DEBTS);

module.exports = router;
