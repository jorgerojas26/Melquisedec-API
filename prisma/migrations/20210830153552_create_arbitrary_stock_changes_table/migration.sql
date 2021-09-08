-- CreateTable
CREATE TABLE `arbitrary_stock_change` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_variant_id` INTEGER NOT NULL,
    `old_stock` DECIMAL(10, 4) NOT NULL,
    `new_stock` DECIMAL(10, 4) NOT NULL,
    `reasons` VARCHAR(255) NOT NULL,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
