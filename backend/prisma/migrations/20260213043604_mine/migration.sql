/*
  Warnings:

  - A unique constraint covering the columns `[grnItemId]` on the table `StockIn` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Supplier` DROP FOREIGN KEY `Supplier_adminId_fkey`;

-- DropIndex
DROP INDEX `Supplier_adminId_fkey` ON `Supplier`;

-- DropIndex
DROP INDEX `Supplier_email_idx` ON `Supplier`;

-- DropIndex
DROP INDEX `Supplier_phone_idx` ON `Supplier`;

-- DropIndex
DROP INDEX `Supplier_phone_key` ON `Supplier`;

-- AlterTable
ALTER TABLE `StockHistory` ADD COLUMN `batchNumber` VARCHAR(191) NULL,
    ADD COLUMN `costAtTransaction` DECIMAL(12, 2) NULL,
    ADD COLUMN `grnId` VARCHAR(191) NULL,
    ADD COLUMN `valuationMethod` ENUM('FIFO', 'LIFO', 'WEIGHTED_AVERAGE') NULL;

-- AlterTable
ALTER TABLE `StockIn` ADD COLUMN `batchNumber` VARCHAR(191) NULL,
    ADD COLUMN `grnItemId` VARCHAR(191) NULL,
    ADD COLUMN `inspectionStatus` ENUM('PENDING', 'INSPECTED', 'APPROVED', 'REJECTED') NULL DEFAULT 'APPROVED',
    ADD COLUMN `landedCost` DECIMAL(10, 2) NULL,
    ADD COLUMN `manufacturingDate` DATETIME(3) NULL,
    ADD COLUMN `qualityNotes` TEXT NULL,
    ADD COLUMN `serialNumbers` JSON NULL,
    ADD COLUMN `valuationMethod` ENUM('FIFO', 'LIFO', 'WEIGHTED_AVERAGE') NULL DEFAULT 'WEIGHTED_AVERAGE';

-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactPerson` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL DEFAULT 'Rwanda',
    ADD COLUMN `creditLimit` DECIMAL(14, 2) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `onTimeDeliveryPct` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `paymentTerms` VARCHAR(191) NULL,
    ADD COLUMN `qualityScore` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `rating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `taxId` VARCHAR(191) NULL,
    MODIFY `address` TEXT NULL,
    MODIFY `adminId` VARCHAR(191) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `PurchaseOrder` (
    `id` VARCHAR(191) NOT NULL,
    `poNumber` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expectedDeliveryDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `shippingCost` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `otherCharges` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `paymentTerms` VARCHAR(191) NULL,
    `deliveryTerms` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `internalNotes` TEXT NULL,
    `createdByAdminId` VARCHAR(191) NULL,
    `createdByEmployeeId` VARCHAR(191) NULL,
    `approvedAt` DATETIME(3) NULL,
    `approvedByAdminId` VARCHAR(191) NULL,
    `approvedByEmployeeId` VARCHAR(191) NULL,
    `closedAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `cancellationReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PurchaseOrder_poNumber_key`(`poNumber`),
    INDEX `PurchaseOrder_poNumber_idx`(`poNumber`),
    INDEX `PurchaseOrder_supplierId_idx`(`supplierId`),
    INDEX `PurchaseOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PurchaseOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productSku` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `orderedQty` DECIMAL(12, 3) NOT NULL,
    `receivedQty` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `remainingQty` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `discountPct` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `taxPct` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `taxAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `lineTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchaseOrderItem_purchaseOrderId_idx`(`purchaseOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoodsReceivingNote` (
    `id` VARCHAR(191) NOT NULL,
    `grnNumber` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `receivedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `receivedByAdminId` VARCHAR(191) NULL,
    `receivedByEmployeeId` VARCHAR(191) NULL,
    `inspectionStatus` ENUM('PENDING', 'INSPECTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `inspectionDate` DATETIME(3) NULL,
    `inspectionNotes` TEXT NULL,
    `qualityNotes` TEXT NULL,
    `hasDiscrepancies` BOOLEAN NOT NULL DEFAULT false,
    `discrepancyNotes` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_APPROVED') NOT NULL DEFAULT 'PENDING',
    `approvedAt` DATETIME(3) NULL,
    `approvedByAdminId` VARCHAR(191) NULL,
    `approvedByEmployeeId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GoodsReceivingNote_grnNumber_key`(`grnNumber`),
    INDEX `GoodsReceivingNote_grnNumber_idx`(`grnNumber`),
    INDEX `GoodsReceivingNote_purchaseOrderId_idx`(`purchaseOrderId`),
    INDEX `GoodsReceivingNote_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GRNItem` (
    `id` VARCHAR(191) NOT NULL,
    `grnId` VARCHAR(191) NOT NULL,
    `poItemId` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productSku` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `orderedQty` DECIMAL(12, 3) NOT NULL,
    `receivedQty` DECIMAL(12, 3) NOT NULL,
    `acceptedQty` DECIMAL(12, 3) NOT NULL,
    `rejectedQty` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NULL,
    `serialNumbers` JSON NULL,
    `manufacturingDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `unitCost` DECIMAL(12, 2) NOT NULL,
    `landedCost` DECIMAL(12, 2) NULL,
    `lineTotal` DECIMAL(14, 2) NOT NULL,
    `locationId` VARCHAR(191) NULL,
    `qualityStatus` ENUM('ACCEPTED', 'REJECTED', 'PENDING_INSPECTION', 'CONDITIONALLY_ACCEPTED') NOT NULL DEFAULT 'ACCEPTED',
    `qualityNotes` TEXT NULL,
    `damageNotes` TEXT NULL,
    `stockInId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GRNItem_stockInId_key`(`stockInId`),
    INDEX `GRNItem_grnId_idx`(`grnId`),
    INDEX `GRNItem_batchNumber_idx`(`batchNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchTracking` (
    `id` VARCHAR(191) NOT NULL,
    `batchNumber` VARCHAR(191) NOT NULL,
    `lotNumber` VARCHAR(191) NULL,
    `serialNumbers` JSON NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productSku` VARCHAR(191) NULL,
    `grnItemId` VARCHAR(191) NULL,
    `manufacturingDate` DATETIME(3) NULL,
    `expiryDate` DATETIME(3) NULL,
    `receivedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `initialQty` DECIMAL(12, 3) NOT NULL,
    `currentQty` DECIMAL(12, 3) NOT NULL,
    `consumedQty` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `unit` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'RECALLED', 'DEPLETED', 'QUARANTINED') NOT NULL DEFAULT 'ACTIVE',
    `supplierBatchRef` VARCHAR(191) NULL,
    `locationId` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BatchTracking_batchNumber_key`(`batchNumber`),
    INDEX `BatchTracking_batchNumber_idx`(`batchNumber`),
    INDEX `BatchTracking_expiryDate_idx`(`expiryDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostBreakdown` (
    `id` VARCHAR(191) NOT NULL,
    `grnId` VARCHAR(191) NOT NULL,
    `baseCost` DECIMAL(14, 2) NOT NULL,
    `shippingCost` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `customsDuties` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `insurance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `handlingCharges` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `otherFees` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `totalLandedCost` DECIMAL(14, 2) NOT NULL,
    `costPerUnit` DECIMAL(12, 2) NOT NULL,
    `totalQuantity` DECIMAL(12, 3) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CostBreakdown_grnId_idx`(`grnId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockLocation` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('WAREHOUSE', 'STORE', 'AISLE', 'SHELF', 'BIN', 'ZONE') NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `capacityLimit` DECIMAL(12, 3) NULL,
    `currentUtilization` DECIMAL(12, 3) NOT NULL DEFAULT 0,
    `managerId` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'FULL', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
    `address` TEXT NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StockLocation_code_key`(`code`),
    INDEX `StockLocation_code_idx`(`code`),
    INDEX `StockLocation_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApprovalWorkflow` (
    `id` VARCHAR(191) NOT NULL,
    `documentType` ENUM('PURCHASE_ORDER', 'GRN', 'STOCK_ADJUSTMENT', 'RETURN') NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NULL,
    `grnId` VARCHAR(191) NULL,
    `requestedByAdminId` VARCHAR(191) NULL,
    `requestedByEmployeeId` VARCHAR(191) NULL,
    `approvalLevel` INTEGER NOT NULL DEFAULT 1,
    `currentApproverId` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED') NOT NULL DEFAULT 'PENDING',
    `approvedAt` DATETIME(3) NULL,
    `approvedByAdminId` VARCHAR(191) NULL,
    `approvedByEmployeeId` VARCHAR(191) NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `approvalHierarchy` JSON NULL,
    `comments` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ApprovalWorkflow_documentType_documentId_idx`(`documentType`, `documentId`),
    INDEX `ApprovalWorkflow_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentAttachment` (
    `id` VARCHAR(191) NOT NULL,
    `referenceType` ENUM('PURCHASE_ORDER', 'GRN', 'SUPPLIER', 'PRODUCT') NOT NULL,
    `referenceId` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NULL,
    `grnId` VARCHAR(191) NULL,
    `supplierId` VARCHAR(191) NULL,
    `documentType` ENUM('INVOICE', 'DELIVERY_NOTE', 'PACKING_LIST', 'QUALITY_CERTIFICATE', 'PHOTO', 'CONTRACT', 'OTHER') NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `uploadedByAdminId` VARCHAR(191) NULL,
    `uploadedByEmployeeId` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DocumentAttachment_referenceType_referenceId_idx`(`referenceType`, `referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlertNotification` (
    `id` VARCHAR(191) NOT NULL,
    `alertType` ENUM('OVER_DELIVERY', 'UNDER_DELIVERY', 'EXPIRED_PRODUCT', 'QUALITY_ISSUE', 'APPROVAL_REQUIRED', 'LOW_STOCK', 'PRICE_VARIANCE', 'MISSING_ITEMS', 'DAMAGED_GOODS') NOT NULL,
    `severity` ENUM('INFO', 'WARNING', 'CRITICAL', 'URGENT') NOT NULL DEFAULT 'INFO',
    `referenceType` VARCHAR(191) NULL,
    `referenceId` VARCHAR(191) NULL,
    `grnId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `acknowledgedAt` DATETIME(3) NULL,
    `acknowledgedByAdminId` VARCHAR(191) NULL,
    `acknowledgedByEmployeeId` VARCHAR(191) NULL,
    `actionTaken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AlertNotification_alertType_idx`(`alertType`),
    INDEX `AlertNotification_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `StockIn_grnItemId_key` ON `StockIn`(`grnItemId`);

-- CreateIndex
CREATE INDEX `StockIn_batchNumber_idx` ON `StockIn`(`batchNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_code_key` ON `Supplier`(`code`);

-- CreateIndex
CREATE INDEX `Supplier_code_idx` ON `Supplier`(`code`);

-- CreateIndex
CREATE INDEX `Supplier_name_idx` ON `Supplier`(`name`);

-- AddForeignKey
ALTER TABLE `StockHistory` ADD CONSTRAINT `StockHistory_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_createdByAdminId_fkey` FOREIGN KEY (`createdByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_createdByEmployeeId_fkey` FOREIGN KEY (`createdByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_approvedByAdminId_fkey` FOREIGN KEY (`approvedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_approvedByEmployeeId_fkey` FOREIGN KEY (`approvedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_receivedByAdminId_fkey` FOREIGN KEY (`receivedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_receivedByEmployeeId_fkey` FOREIGN KEY (`receivedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_approvedByAdminId_fkey` FOREIGN KEY (`approvedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoodsReceivingNote` ADD CONSTRAINT `GoodsReceivingNote_approvedByEmployeeId_fkey` FOREIGN KEY (`approvedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItem` ADD CONSTRAINT `GRNItem_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItem` ADD CONSTRAINT `GRNItem_poItemId_fkey` FOREIGN KEY (`poItemId`) REFERENCES `PurchaseOrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItem` ADD CONSTRAINT `GRNItem_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `StockLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GRNItem` ADD CONSTRAINT `GRNItem_stockInId_fkey` FOREIGN KEY (`stockInId`) REFERENCES `StockIn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchTracking` ADD CONSTRAINT `BatchTracking_grnItemId_fkey` FOREIGN KEY (`grnItemId`) REFERENCES `GRNItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchTracking` ADD CONSTRAINT `BatchTracking_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `StockLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CostBreakdown` ADD CONSTRAINT `CostBreakdown_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockLocation` ADD CONSTRAINT `StockLocation_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `StockLocation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockLocation` ADD CONSTRAINT `StockLocation_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_requestedByAdminId_fkey` FOREIGN KEY (`requestedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_requestedByEmployeeId_fkey` FOREIGN KEY (`requestedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_approvedByAdminId_fkey` FOREIGN KEY (`approvedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ApprovalWorkflow` ADD CONSTRAINT `ApprovalWorkflow_approvedByEmployeeId_fkey` FOREIGN KEY (`approvedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentAttachment` ADD CONSTRAINT `DocumentAttachment_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentAttachment` ADD CONSTRAINT `DocumentAttachment_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentAttachment` ADD CONSTRAINT `DocumentAttachment_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentAttachment` ADD CONSTRAINT `DocumentAttachment_uploadedByAdminId_fkey` FOREIGN KEY (`uploadedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentAttachment` ADD CONSTRAINT `DocumentAttachment_uploadedByEmployeeId_fkey` FOREIGN KEY (`uploadedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_grnId_fkey` FOREIGN KEY (`grnId`) REFERENCES `GoodsReceivingNote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_acknowledgedByAdminId_fkey` FOREIGN KEY (`acknowledgedByAdminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_acknowledgedByEmployeeId_fkey` FOREIGN KEY (`acknowledgedByEmployeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
