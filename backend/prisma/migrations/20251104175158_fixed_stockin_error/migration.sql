/*
  Warnings:

  - You are about to alter the column `stockinId` on the `stockout` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `stockout` DROP FOREIGN KEY `StockOut_stockinId_fkey`;

-- DropIndex
DROP INDEX `StockOut_stockinId_fkey` ON `stockout`;

-- AlterTable
ALTER TABLE `stockout` MODIFY `stockinId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `StockOut` ADD CONSTRAINT `StockOut_stockinId_fkey` FOREIGN KEY (`stockinId`) REFERENCES `Stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
