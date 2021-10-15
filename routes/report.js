const router = require('express').Router();

const controller = require('../controllers/report');

router.route('/client/top').get(controller.GET_TOP_CLIENTS);

router.route('/product/cost-fluctuation/:productId').get(controller.GET_PRODUCT_COST_FLUCTUATION);
router.route('/product/average-sales/:productId').get(controller.GET_PRODUCT_AVERAGE_SALES);

router.route('/sale').get(controller.GET_SALE_REPORT);
router.route('/sale/daily-sales').get(controller.GET_DAILY_SALES);

module.exports = router;
