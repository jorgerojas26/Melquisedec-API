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
        DECLARE payment_currency VARCHAR(191);
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
