CREATE TRIGGER `addStockOnSaleAnnuled`
    AFTER UPDATE
    ON sale FOR EACH ROW
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE sale_product_quantity DECIMAL(10,4);
        DECLARE sale_product_id INT;

        DECLARE sale_products CURSOR FOR
        SELECT sale_product.product_variant_id, sale_product.quantity FROM sale_product WHERE sale_product.saleId = NEW.id;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        IF NEW.status = 0 THEN
            OPEN sale_products;
                ins_loop: LOOP
                    FETCH sale_products INTO sale_product_id, sale_product_quantity;
                        IF done THEN
                            LEAVE ins_loop;
                        END IF;
                        UPDATE product_variant
                        SET stock = product_variant.stock + sale_product_quantity
                        WHERE id = sale_product_id;
                END LOOP;
            CLOSE sale_products;
        END IF;
    END
