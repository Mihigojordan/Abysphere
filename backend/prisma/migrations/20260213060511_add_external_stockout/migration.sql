-- AlterTable
ALTER TABLE `StockOut` ADD COLUMN `externalItemName` VARCHAR(191) NULL,
    ADD COLUMN `externalSku` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Supplier` ALTER COLUMN `updatedAt` DROP DEFAULT;
