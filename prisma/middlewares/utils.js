const SET_PRODUCT_FULL_NAME = (product_variant) => {
    if (product_variant.product) {
        return `${product_variant.product.name} ${product_variant.product.brand} ${product_variant.name}`;
    } else {
        return product_variant.name;
    }
};

const FIND_OBJECT_BY_KEY = (obj, keyToFind) => {
    return Object.entries(obj).reduce(
        (acc, [key, value]) =>
            key === keyToFind && value
                ? acc.concat(value)
                : typeof value === 'object' && value
                ? acc.concat(FIND_OBJECT_BY_KEY(value, keyToFind))
                : acc,
        []
    );
};

const FIND_OBJECT_TO_MODIFY = (params, object_to_search, key) => {
    let actual_object = null;
    if (params.model === key) {
        actual_object = object_to_search;

        const found = FIND_OBJECT_BY_KEY(object_to_search, key);
        if (found.length) {
            actual_object = [...found, actual_object];
        }
    } else {
        actual_object = FIND_OBJECT_BY_KEY(object_to_search, key);
        actual_object = actual_object && actual_object[key] ? actual_object[key] : actual_object;
    }

    return actual_object;
};

module.exports = {
    SET_PRODUCT_FULL_NAME,
    FIND_OBJECT_BY_KEY,
    FIND_OBJECT_TO_MODIFY,
};
