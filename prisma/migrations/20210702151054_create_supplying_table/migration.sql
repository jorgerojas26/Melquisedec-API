
-- AlterTable
ALTER TABLE `product_variant` MODIFY `stock` DECIMAL(10, 4) DEFAULT 0;

-- AlterTable
ALTER TABLE `product_variant_log` MODIFY `old_price` DECIMAL(19, 4),
    MODIFY `old_stock` DECIMAL(10, 4),
    MODIFY `stock` DECIMAL(10, 4) NOT NULL;

CREATE TRIGGER `updateProductPriceAndStockOnSupplyingInsert`
  AFTER INSERT
  ON `supplying` FOR EACH ROW
    UPDATE product_variant SET `price` = (NEW.buyPrice)+((NEW.buyPrice)*(product_variant.profitPercent/100)),
    `stock` = `stock` + NEW.quantity WHERE `id` = NEW.product_variant_id;

CREATE TRIGGER `updateProductPriceAndStockOnSupplyingUpdate`
  AFTER UPDATE
  ON `supplying` FOR EACH ROW
  BEGIN
    DECLARE lastSupplyingId Int;
    DECLARE lastSupplyingPrice DECIMAL(19,4);
    DECLARE oldProductVariantProfitPercent DECIMAL(10,4);
    SET lastSupplyingId = (SELECT id FROM `supplying` WHERE `supplying`.product_variant_id = NEW.product_variant_id ORDER BY `supplying`.id DESC LIMIT 0,1);

    IF OLD.product_variant_id != NEW.product_variant_id THEN
      SET oldProductVariantProfitPercent = (SELECT `profitPercent` FROM product_variant WHERE `product_variant`.id = OLD.product_variant_id);
      SET lastSupplyingPrice = IFNULL((SELECT `buyPrice` FROM supplying WHERE `supplying`.product_variant_id = OLD.product_variant_id ORDER BY `supplying`.id DESC LIMIT 0,1), 0);

      UPDATE `product_variant`
      SET `price` = lastSupplyingPrice + (lastSupplyingPrice * (oldProductVariantProfitPercent / 100)),
      `stock` = `stock` - OLD.quantity
      WHERE `product_variant`.id = OLD.product_variant_id;

      IF lastSupplyingId = NEW.id THEN
        UPDATE `product_variant`
        SET `price` = NEW.buyPrice + (NEW.buyPrice * (`product_variant`.profitPercent / 100)),
        `stock` = `stock` + NEW.quantity
        WHERE `product_variant`.id = NEW.product_variant_id;
      ELSE
        UPDATE `product_variant`
         SET `stock` = `stock` + NEW.quantity
         WHERE `product_variant`.id = NEW.product_variant_id;
      END IF;

    ELSE

      IF lastSupplyingId = NEW.id THEN
        UPDATE `product_variant`
        SET `price` = NEW.buyPrice + (NEW.buyPrice * (`product_variant`.profitPercent / 100)),
        `stock` = `stock` + (NEW.quantity - OLD.quantity)
        WHERE `product_variant`.id = NEW.product_variant_id;
      ELSE
        UPDATE `product_variant`
           SET `stock` = `stock` + (NEW.quantity - OLD.quantity)
         WHERE `product_variant`.id = NEW.product_variant_id;
      END IF;
    END IF;
  END;

CREATE TRIGGER `updateProductPriceAndStockOnSupplyingDelete`
  AFTER DELETE
  ON `supplying` FOR EACH ROW
    UPDATE product_variant SET `stock` = `stock` - OLD.quantity WHERE `id` = OLD.product_variant_id;

CREATE TRIGGER `updateProductProfitPercentOnPriceChange`
  BEFORE UPDATE
  ON `product_variant` FOR EACH ROW
  BEGIN
    DECLARE lastSupplyingPrice DECIMAL(19,4);
    SET lastSupplyingPrice = IFNULL((SELECT buyPrice FROM `supplying` WHERE `supplying`.product_variant_id=NEW.id ORDER BY `supplying`.id DESC LIMIT 0,1), 0);

    IF OLD.price != NEW.price THEN
      SET NEW.profitPercent = IF(NEW.price != 0, ((NEW.price - lastSupplyingPrice) / lastSupplyingPrice) * 100, 30);
    END IF;
  END;

