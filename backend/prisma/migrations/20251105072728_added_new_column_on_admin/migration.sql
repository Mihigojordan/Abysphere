-- AlterTable
ALTER TABLE `admin` ADD COLUMN `message` VARCHAR(191) NULL,
    ADD COLUMN `messageExpiry` DATETIME(3) NULL;
