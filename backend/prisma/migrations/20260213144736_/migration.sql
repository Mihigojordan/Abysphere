-- CreateTable
CREATE TABLE `Debit` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `totalAmount` DOUBLE NOT NULL,
    `stockOutId` VARCHAR(191) NULL,
    `payments` JSON NULL,
    `status` ENUM('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `adminId` VARCHAR(191) NULL,
    `employeeId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Debit` ADD CONSTRAINT `Debit_stockOutId_fkey` FOREIGN KEY (`stockOutId`) REFERENCES `StockOut`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Debit` ADD CONSTRAINT `Debit_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Debit` ADD CONSTRAINT `Debit_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
