-- AlterTable
ALTER TABLE `Client` MODIFY `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProformaInvoice` ADD COLUMN `clientId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `ProformaInvoice_clientId_idx` ON `ProformaInvoice`(`clientId`);

-- AddForeignKey
ALTER TABLE `ProformaInvoice` ADD CONSTRAINT `ProformaInvoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
