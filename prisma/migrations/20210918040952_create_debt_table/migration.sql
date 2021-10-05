-- CreateTable
CREATE TABLE `debt` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saleId` INTEGER NOT NULL,
    `original_amount` DECIMAL(65, 30) NOT NULL,
    `current_amount` DECIMAL(65, 30) NOT NULL,
    `paid` TINYINT NOT NULL DEFAULT 0,
    `paid_date` DATETIME,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`),
    FOREIGN KEY (`saleId`) REFERENCES `sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TRIGGER `set_current_amount_before_insert`
  BEFORE INSERT
  ON `debt` FOR EACH ROW
  SET NEW.current_amount = NEW.original_amount;
