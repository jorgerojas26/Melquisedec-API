-- CreateTable
CREATE TABLE `bank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bank_name` VARCHAR(255) NOT NULL,
    `number` VARCHAR(25) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `owner_name` VARCHAR(255) NOT NULL,
    `owner_cedula` VARCHAR(255) NOT NULL,
    `owner_phone_number` VARCHAR(11) NOT NULL,
    `createdAt` TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `payment` ADD FOREIGN KEY (`bank_id`) REFERENCES `bank`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

