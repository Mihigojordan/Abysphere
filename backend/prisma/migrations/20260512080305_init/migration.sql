/*
  Warnings:

  - You are about to drop the `debit` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code,adminId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `debit` DROP FOREIGN KEY `Debit_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `debit` DROP FOREIGN KEY `Debit_employeeId_fkey`;

-- DropForeignKey
ALTER TABLE `debit` DROP FOREIGN KEY `Debit_stockOutId_fkey`;

-- DropIndex
DROP INDEX `Client_email_key` ON `client`;

-- DropIndex
DROP INDEX `Supplier_code_key` ON `supplier`;

-- DropIndex
DROP INDEX `Supplier_email_key` ON `supplier`;

-- DropTable
DROP TABLE `debit`;

-- CreateTable
CREATE TABLE `Expense` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `type` ENUM('DEBIT', 'CREDIT') NOT NULL DEFAULT 'DEBIT',
    `adminId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Expense_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_code_adminId_key` ON `Supplier`(`code`, `adminId`);

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
