-- CreateTable
CREATE TABLE `supplying` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_variant_id` INTEGER NOT NULL,
    `supplierId` INTEGER NOT NULL,
    `buyPrice` DECIMAL(19,4) NOT NULL,
    `quantity` DECIMAL(10,4) NOT NULL,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (`supplierId`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency_rate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency` VARCHAR(20) NOT NULL,
    `value` DECIMAL(19, 4) NOT NULL,
    `rounding` FLOAT, 

    UNIQUE INDEX `currency_rate.currency_unique`(`currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
