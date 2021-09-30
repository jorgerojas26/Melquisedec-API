const router = require('express').Router();

const controller = require('../controllers/debt');

const paginate = require('../middlewares/paginate');

const saleSchema = require('../dataSchema/sale');

router.route('/').get(paginate, controller.GET_DEBTS);

module.exports = router;
