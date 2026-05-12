-- CreateTable
CREATE TABLE `PermissionTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `featureName` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `canViewOwn` BOOLEAN NOT NULL DEFAULT false,
    `canViewAll` BOOLEAN NOT NULL DEFAULT false,
    `canCreate` BOOLEAN NOT NULL DEFAULT false,
    `canUpdate` BOOLEAN NOT NULL DEFAULT false,
    `canDelete` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PermissionTemplate_adminId_name_featureName_key`(`adminId`, `name`, `featureName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployeePermissionAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `EmployeePermissionAssignment_employeeId_templateId_key`(`employeeId`, `templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PermissionTemplate` ADD CONSTRAINT `PermissionTemplate_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeePermissionAssignment` ADD CONSTRAINT `EmployeePermissionAssignment_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeePermissionAssignment` ADD CONSTRAINT `EmployeePermissionAssignment_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `PermissionTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployeePermissionAssignment` ADD CONSTRAINT `EmployeePermissionAssignment_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
