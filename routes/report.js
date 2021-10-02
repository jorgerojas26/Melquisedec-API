const router = require('express').Router();

const controller = require('../controllers/report');

router.route('/sale').get(controller.GET_SALE_REPORT);

module.exports = router;
