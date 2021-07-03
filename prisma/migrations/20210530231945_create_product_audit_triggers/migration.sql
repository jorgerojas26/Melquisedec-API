-- AlterTable
ALTER TABLE `product_variant_log` 
    ADD COLUMN `old_name` VARCHAR(255) AFTER `productId`,
    ADD COLUMN `old_price` FLOAT AFTER `name`,
    ADD COLUMN `old_productId` INTEGER AFTER `id`,
    ADD COLUMN `old_profitPercent` FLOAT AFTER `price`,
    ADD COLUMN `old_stock` FLOAT AFTER `unitValue`,
    ADD COLUMN `old_unitValue` FLOAT AFTER `profitPercent`;

-- CreateIndex
CREATE INDEX `old_productId` ON `product_variant_log`(`old_productId`);

-- AddForeignKey
ALTER TABLE `product_variant_log` ADD FOREIGN KEY (`old_productId`) REFERENCES `product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TRIGGER `insertLog` AFTER INSERT ON `product_variant`
 FOR EACH ROW INSERT INTO product_variant_log VALUES(null, null, NEW.productId, null, NEW.name, null, NEW.price, null, NEW.profitPercent, null, NEW.unitValue, null, NEW.stock, NEW.imagePath, "inserted", CURRENT_TIMESTAMP());

CREATE TRIGGER `updateLog` AFTER UPDATE ON `product_variant`
 FOR EACH ROW INSERT INTO product_variant_log VALUES(null, OLD.productId, NEW.productId, OLD.name, NEW.name, OLD.price, NEW.price, OLD.profitPercent, NEW.profitPercent, OLD.unitValue, NEW.unitValue, OLD.stock, NEW.stock, NEW.imagePath, "updated", CURRENT_TIMESTAMP());

