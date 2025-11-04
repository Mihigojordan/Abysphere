/*
  Warnings:

  - Added the required column `adminId` to the `SalesReturn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `salesreturn` ADD COLUMN `adminId` VARCHAR(191) NOT NULL;
