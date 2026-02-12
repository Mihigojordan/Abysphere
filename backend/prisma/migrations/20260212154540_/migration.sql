-- AlterTable
ALTER TABLE `client` ADD COLUMN `adminId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
