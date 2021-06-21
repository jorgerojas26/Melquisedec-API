const router = require("express").Router();

const controller = require("../controllers/currencyRate");

const validateBody = require("../middlewares/validateBody");

const currencyRateSchema = require("../dataSchema/currencyRate");

router.route("/").get(controller.GET_CURRENCY_RATES).post(validateBody(currencyRateSchema), controller.CREATE_CURRENCY_RATE);

router.route("/:currencySymbol").get(controller.GET_CURRENCY_RATE).patch(validateBody(currencyRateSchema), controller.UPDATE_CURRENCY_RATE);

module.exports = router;
