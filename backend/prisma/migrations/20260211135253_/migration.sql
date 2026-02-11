/*
  Warnings:

  - You are about to drop the column `address` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `application_letter` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account_number` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `cv` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `departmentId` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `marital_status` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the `department` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `department` DROP FOREIGN KEY `Department_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `employee` DROP FOREIGN KEY `Employee_departmentId_fkey`;

-- DropIndex
DROP INDEX `Employee_departmentId_fkey` ON `employee`;

-- AlterTable
ALTER TABLE `employee` DROP COLUMN `address`,
    DROP COLUMN `application_letter`,
    DROP COLUMN `bank_account_number`,
    DROP COLUMN `bank_name`,
    DROP COLUMN `cv`,
    DROP COLUMN `date_of_birth`,
    DROP COLUMN `departmentId`,
    DROP COLUMN `experience`,
    DROP COLUMN `marital_status`,
    ADD COLUMN `department` VARCHAR(191) NULL,
    MODIFY `first_name` VARCHAR(191) NULL,
    MODIFY `last_name` VARCHAR(191) NULL,
    MODIFY `gender` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `national_id` VARCHAR(191) NULL,
    MODIFY `position` VARCHAR(191) NULL,
    MODIFY `date_hired` DATETIME(3) NULL;

-- DropTable
DROP TABLE `department`;
