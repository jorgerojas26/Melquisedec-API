-- CreateTable
CREATE TABLE `money` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_method_id` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `createdAt` TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `money_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moneyId` INTEGER NOT NULL,
    `old_amount` DECIMAL(65, 30) NOT NULL,
    `new_amount` DECIMAL(65, 30) NOT NULL,
    `reasons` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `debt_saleId_unique` ON `debt`(`saleId`);

-- AddForeignKey
ALTER TABLE `product_variant` ADD CONSTRAINT `product_variant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_log` ADD CONSTRAINT `product_variant_log_old_productId_fkey` FOREIGN KEY (`old_productId`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_log` ADD CONSTRAINT `product_variant_log_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplying` ADD CONSTRAINT `supplying_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplying` ADD CONSTRAINT `supplying_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `sale_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_currency_rate` ADD CONSTRAINT `sale_currency_rate_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_product` ADD CONSTRAINT `sale_product_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_product` ADD CONSTRAINT `sale_product_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arbitrary_stock_change` ADD CONSTRAINT `arbitrary_stock_change_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debt` ADD CONSTRAINT `debt_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RedefineIndex
CREATE UNIQUE INDEX `client_cedula_key` ON `client`(`cedula`);
DROP INDEX `client.cedula_unique` ON `client`;

-- RedefineIndex
CREATE UNIQUE INDEX `currency_rate_currency_key` ON `currency_rate`(`currency`);
DROP INDEX `currency_rate.currency_unique` ON `currency_rate`;

-- RedefineIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);
DROP INDEX `user.username_unique` ON `user`;

CREATE TRIGGER `updateAmountOnPaymentInsert`
    AFTER INSERT
    ON `payment` FOR EACH ROW
    UPDATE money
    SET amount = money.amount + NEW.amount
    WHERE money.payment_method_id = NEW.payment_method_id AND money.currency = NEW.currency;

CREATE TRIGGER `updateAmountOnSaleAnulled`
    AFTER UPDATE
    ON sale FOR EACH ROW
    BEGIN
        DECLARE done INT DEFAULT FALSE;
        DECLARE payment_amount DECIMAL(65,30);
        DECLARE payment_currency VARCHAR(20);
        DECLARE payment_method_id INT;

        DECLARE payments CURSOR FOR
        SELECT payment.amount, payment.currency, payment.payment_method_id FROM payment WHERE payment.sale_id = NEW.id;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

        IF NEW.status = 0 THEN
            OPEN payments;
                ins_loop: LOOP
                    FETCH payments INTO payment_amount, payment_currency, payment_method_id;
                        IF done THEN
                            LEAVE ins_loop;
                        END IF;
                        UPDATE money
                        SET amount = money.amount - payment_amount
                        WHERE money.payment_method_id = payment_method_id AND money.currency = payment_currency;
                END LOOP;
            CLOSE payments;
        END IF;
    END
