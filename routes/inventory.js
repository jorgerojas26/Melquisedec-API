const router = require('express').Router();

const controller = require('../controllers/inventory');

const paginate = require('../middlewares/paginate');

router.route('/').get(paginate, controller.GET_ARBITRARY_MOVES);

module.exports = router;
