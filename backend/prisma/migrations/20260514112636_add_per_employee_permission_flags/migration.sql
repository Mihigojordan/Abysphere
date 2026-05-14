-- AlterTable
ALTER TABLE `employeepermissionassignment` ADD COLUMN `canCreate` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canDelete` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canUpdate` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canViewAll` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `canViewOwn` BOOLEAN NOT NULL DEFAULT false;
