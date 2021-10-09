UPDATE product_variant
INNER JOIN product ON product.id = product_variant.productId
SET product_variant.name = CONCAT(product.name, ' ', IF(product.brand IS NOT NULL AND product.brand != '', CONCAT(product.brand, ' ', product_variant.name), product_variant.name));
