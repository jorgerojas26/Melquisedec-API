const router = require('express').Router();

const controller = require('../controllers/product_variant');

const paginate = require('../middlewares/paginate');
const validateBody = require('../middlewares/validateBody');

const productVariantSchema = require('../dataSchema/product_variant');

router
    .route('/')
    .get(paginate, controller.GET_PRODUCT_VARIANTS)
    .post(validateBody(productVariantSchema), controller.CREATE_PRODUCT_VARIANT);

router.route('/:id').patch(validateBody(productVariantSchema), controller.UPDATE_PRODUCT_VARIANT).delete(controller.DELETE_PRODUCT_VARIANT);

module.exports = router;
