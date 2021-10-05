-- CreateTable
CREATE TABLE `payment_method` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_method_id` INTEGER NOT NULL,
    `sale_id` INTEGER NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `currency` VARCHAR(20) NOT NULL,
    `transaction_code` VARCHAR(255),
    `bank_id` INTEGER,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`sale_id`) REFERENCES `sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`payment_method_id`) REFERENCES `payment_method`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TRIGGER `updateIfExistsDebtOnInsert`
    AFTER INSERT
    ON `payment` FOR EACH ROW
    BEGIN
        DECLARE payment_currency_rate DECIMAL(65,30);
        DECLARE debt_current_amount DECIMAL(65,30);
        DECLARE new_payment_total_amount DECIMAL(65,30);

        SET payment_currency_rate = (SELECT value FROM sale_currency_rate WHERE saleId = NEW.sale_id AND currency = "PAYMENT_VES");
        SET debt_current_amount = (SELECT current_amount from debt where debt.saleId = NEW.sale_id) * payment_currency_rate;

        IF debt_current_amount > 0 THEN
            SET new_payment_total_amount = CASE WHEN NEW.currency = "VES" THEN NEW.amount WHEN NEW.currency = "USD" THEN NEW.amount * payment_currency_rate END;

                IF new_payment_total_amount >= ROUND(debt_current_amount, 2) THEN
                    UPDATE debt 
                    SET paid = 1,
                    current_amount = 0,
                    paid_date = CURRENT_TIMESTAMP(0)
                    WHERE debt.saleId = NEW.sale_id;
                ELSE
                    IF NEW.createdAt > (SELECT createdAt FROM debt WHERE debt.saleId = NEW.sale_id) THEN
                        UPDATE debt
                        SET current_amount = debt.current_amount - (new_payment_total_amount / payment_currency_rate)
                        WHERE debt.saleId = NEW.sale_id;
                    END IF;
                END IF;
        END IF;
    END;


