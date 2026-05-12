-- AlterTable
ALTER TABLE `client` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `expense` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `supplier` ADD COLUMN `employeeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesReturn` ADD CONSTRAINT `SalesReturn_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
