-- CreateTable
CREATE TABLE `supplying` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_variant_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencyRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(3) NOT NULL,
    `value` DECIMAL(19, 2) NOT NULL,
    `rounding` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `currencyRate.currency_unique`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `supplying` ADD FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
