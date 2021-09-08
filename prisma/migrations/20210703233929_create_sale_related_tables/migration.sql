CREATE TABLE `sale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` INTEGER,
    `totalAmount` DECIMAL(19, 4) NOT NULL,
    `status` TINYINT(1) NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`clientId`) REFERENCES `client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sale_currency_rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `currency` VARCHAR(3) NOT NULL,
    `value` DECIMAL(19, 4) NOT NULL,
    `rounding` INTEGER NOT NULL DEFAULT 1,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sale_product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `product_variant_id` INTEGER NOT NULL,
    `price` DECIMAL(19, 4) NOT NULL,
    `quantity` DECIMAL(10, 4) NOT NULL,
    `profitPercent` DECIMAL(10, 4) NOT NULL,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TRIGGER `setCurrencyRatesOnSaleInsert`
  AFTER INSERT
  ON `sale` FOR EACH ROW
  INSERT INTO `sale_currency_rate` (saleId, currency, value, rounding)
  SELECT NEW.id, currency, value, rounding FROM `currencyRate`;

CREATE TRIGGER `setSaleProductProfitPercentOnInsert`
  BEFORE INSERT
  ON `sale_product` FOR EACH ROW
                      BEGIN
                        DECLARE profitPercent DECIMAL (10,4)
                      END;
