const router = require('express').Router();

const controller = require('../controllers/report');

router.route('/sale').get(controller.GET_SALE_REPORT);
router.route('/client/top').get(controller.GET_TOP_CLIENTS);

module.exports = router;
