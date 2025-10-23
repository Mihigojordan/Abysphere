-- CreateTable
CREATE TABLE `_AdminFeatures` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AdminFeatures_AB_unique`(`A`, `B`),
    INDEX `_AdminFeatures_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AdminFeatures` ADD CONSTRAINT `_AdminFeatures_A_fkey` FOREIGN KEY (`A`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AdminFeatures` ADD CONSTRAINT `_AdminFeatures_B_fkey` FOREIGN KEY (`B`) REFERENCES `SystemFeature`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
