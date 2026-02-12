-- AlterTable
ALTER TABLE `stock` ADD COLUMN `expiryDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `stockhistory` ADD COLUMN `stockId` INTEGER NULL,
    MODIFY `stockInId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stockin` ADD COLUMN `expiryDate` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `StockHistory` ADD CONSTRAINT `StockHistory_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
