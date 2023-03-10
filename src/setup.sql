-- MySQL Script generated by MySQL Workbench
-- Fri Jan 27 13:49:28 2023
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

-- -----------------------------------------------------
-- Schema shopping_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `shopping_db` DEFAULT CHARACTER SET utf8 ;
USE `shopping_db` ;

-- -----------------------------------------------------
-- Table `shopping_db`.`Products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Products` (
  `Product_id` INT(11) NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(45) NOT NULL,
  `img_address` MEDIUMTEXT NULL DEFAULT NULL,
  `price` INT(11) UNSIGNED NOT NULL,
  `stock` INT(11) NOT NULL,
  `description` MEDIUMTEXT NULL DEFAULT NULL,
  `manufacturer` VARCHAR(45) NULL DEFAULT NULL,
  `radius` INT(11) NULL DEFAULT NULL,
  `units_sold` INT(11) NULL DEFAULT '0',
  `color` VARCHAR(45) NULL DEFAULT NULL,
  `rpm` INT(11) NULL DEFAULT NULL,
  `effect` INT(11) NULL DEFAULT NULL,
  `sound` INT(11) NULL DEFAULT NULL,
  `category` VARCHAR(45) NULL DEFAULT NULL,
  `published` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`Product_id`))
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `shopping_db`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Users` (
  `User_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(45) NOT NULL UNIQUE,
  `account_create_time` DATE NOT NULL,
  `password_hash` VARCHAR(70) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `permission` INT(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`User_id`))
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `shopping_db`.`Basket_Items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Basket_Items` (
  `Users_User_id` INT(11) NOT NULL,
  `Products_Product_id` INT(11) NOT NULL,
  `amount` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`Users_User_id`, `Products_Product_id`),
  FOREIGN KEY (`Products_Product_id`)
    REFERENCES `shopping_db`.`Products` (`Product_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (`Users_User_id`)
    REFERENCES `shopping_db`.`Users` (`User_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `shopping_db`.`Order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Order` (
  `Order_id` INT(11) NOT NULL AUTO_INCREMENT,
  `Users_User_id` INT(11) NOT NULL,
  `timestamp` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`Order_id`),
  FOREIGN KEY (`Users_User_id`)
    REFERENCES `shopping_db`.`Users` (`User_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
DEFAULT CHARACTER SET = utf8;

-- -----------------------------------------------------
-- Table `shopping_db`.`Order_Item`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Order_Item` (
  `Order_Order_id` INT(11) NOT NULL,
  `Products_Product_id` INT(11) NOT NULL,
  `amount` INT(11) NULL DEFAULT NULL,
  PRIMARY KEY (`Order_Order_id`, `Products_Product_id`),
  FOREIGN KEY (`Products_Product_id`)
    REFERENCES `shopping_db`.`Products` (`Product_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (`Order_Order_id`)
    REFERENCES `shopping_db`.`Order` (`Order_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
DEFAULT CHARACTER SET = utf8;

-- -----------------------------------------------------
-- Table `shopping_db`.`Reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `shopping_db`.`Reviews` (
  `Reviews_User_id` INT(11) NOT NULL,
  `Reviews_Product_id` INT(11) NOT NULL,
  `title` TINYTEXT NULL DEFAULT NULL,
  `rating` INT(1) NULL DEFAULT NULL,
  `body` MEDIUMTEXT NULL DEFAULT NULL,
  `reviewTime` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`Reviews_User_id`, `Reviews_Product_id`),
  FOREIGN KEY (`Reviews_Product_id`)
    REFERENCES `shopping_db`.`Products` (`Product_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  FOREIGN KEY (`Reviews_User_id`)
    REFERENCES `shopping_db`.`Users` (`User_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
DEFAULT CHARACTER SET = utf8;