const router = require('express').Router();

const controller = require('../controllers/product_variant');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const productVariantSchema = require('../dataSchema/product_variant');

router
    .route('/')
    .get(paginate, controller.GET_PRODUCT_VARIANTS)
    .post(validateBody(productVariantSchema), controller.CREATE_PRODUCT_VARIANT);

router
    .route('/:id')
    .get(controller.GET_PRODUCT_VARIANT_BY_ID)
    .patch(validateBody(productVariantSchema), controller.UPDATE_PRODUCT_VARIANT)
    .delete(controller.DELETE_PRODUCT_VARIANT);
router.route('/:id/supplyings').get(paginate, controller.GET_SUPPLYINGS);

module.exports = router;
