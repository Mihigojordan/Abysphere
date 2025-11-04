-- CreateTable
CREATE TABLE `StockOut` (
    `id` VARCHAR(191) NOT NULL,
    `stockinId` VARCHAR(191) NULL,
    `adminId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `soldPrice` DECIMAL(10, 2) NULL,
    `clientName` VARCHAR(191) NULL,
    `clientEmail` VARCHAR(191) NULL,
    `clientPhone` VARCHAR(191) NULL,
    `paymentMethod` ENUM('MOMO', 'CARD', 'CASH') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StockOut_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockOut` ADD CONSTRAINT `StockOut_stockinId_fkey` FOREIGN KEY (`stockinId`) REFERENCES `StockIn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOut` ADD CONSTRAINT `StockOut_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockOut` ADD CONSTRAINT `StockOut_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
