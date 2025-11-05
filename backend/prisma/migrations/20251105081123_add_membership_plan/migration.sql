-- CreateTable
CREATE TABLE `MembershipPlan` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `planName` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `expireTime` DATETIME(3) NOT NULL,
    `amountPaid` DOUBLE NOT NULL,
    `shortDescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MembershipPlan_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MembershipPlan` ADD CONSTRAINT `MembershipPlan_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
