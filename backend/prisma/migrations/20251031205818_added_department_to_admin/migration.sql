/*
  Warnings:

  - Added the required column `adminId` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `department` ADD COLUMN `adminId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
