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
        DECLARE debtExists TINYINT;
        DECLARE paymentTotal DECIMAL(65,30);
        DECLARE currency_rate_usd DECIMAL(65,30);
        DECLARE currency_rate_system_usd DECIMAL(65,30);
        DECLARE sale_total_USD DECIMAL(65,30);

        SET debtExists = (SELECT EXISTS(SELECT COUNT(*) from debt where id = NEW.sale_id));

        IF debtExists > 0 THEN
            SET sale_total_USD = (SELECT totalAmount FROM sale WHERE id = NEW.sale_id);
            SET currency_rate_usd = (SELECT value FROM sale_currency_rate WHERE saleId = NEW.sale_id AND currency = "USD");
            SET currency_rate_system_usd = (SELECT value FROM sale_currency_rate WHERE saleId = NEW.sale_id AND currency = "SYSTEM_USD");
            SET paymentTotal = (SELECT SUM(CASE WHEN payment.currency = "VES" THEN payment.amount / currency_rate_system_usd WHEN payment.currency = "USD" THEN payment.amount * currency_rate_usd / currency_rate_system_usd END)  FROM payment WHERE sale_id = NEW.sale_id);
                IF paymentTotal >= sale_total_USD THEN
                    UPDATE debt 
                    SET paid = 1,
                    paid_date = CURRENT_TIMESTAMP(0)
                    WHERE debt.saleId = NEW.sale_id;
                ELSE 
                END IF;
        END IF;
    END;


