import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoodsReceivingNote, GRNStatus, InspectionStatus, QualityStatus, Prisma } from '../../../generated/prisma';

export interface CreateGRNDto {
    purchaseOrderId: string;
    supplierId: string;
    receivedDate?: Date;
    receivedByAdminId?: string;
    receivedByEmployeeId?: string;
    notes?: string;
    items: CreateGRNItemDto[];
    costBreakdown?: CostBreakdownDto;
}

export interface CreateGRNItemDto {
    poItemId?: string;
    productName: string;
    productSku?: string;
    description?: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty?: number;
    unit: string;
    unitCost: number;
    batchNumber?: string;
    serialNumbers?: string[];
    manufacturingDate?: Date;
    expiryDate?: Date;
    locationId?: string;
    qualityStatus?: QualityStatus;
    qualityNotes?: string;
    damageNotes?: string;
}

export interface CostBreakdownDto {
    shippingCost?: number;
    customsDuties?: number;
    insurance?: number;
    handlingCharges?: number;
    otherFees?: number;
}

@Injectable()
export class GRNService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate unique GRN number
     */
    private async generateGRNNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `GRN-${year}-${month}-`;

        const lastGRN = await this.prisma.goodsReceivingNote.findFirst({
            where: { grnNumber: { startsWith: prefix } },
            orderBy: { createdAt: 'desc' },
        });

        const lastNumber = lastGRN ? parseInt(lastGRN.grnNumber.split('-')[3] || '0', 10) : 0;
        const nextNumber = lastNumber + 1;
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    /**
     * Calculate landed cost per unit
     */
    private calculateLandedCost(
        baseCost: number,
        totalQty: number,
        breakdown?: CostBreakdownDto,
    ): number {
        if (!breakdown) return baseCost;

        const additionalCosts =
            (breakdown.shippingCost || 0) +
            (breakdown.customsDuties || 0) +
            (breakdown.insurance || 0) +
            (breakdown.handlingCharges || 0) +
            (breakdown.otherFees || 0);

        const costPerUnit = additionalCosts / totalQty;
        return baseCost + costPerUnit;
    }

    /**
     * Create GRN
     */
    async create(data: CreateGRNDto): Promise<any> {
        if (!data.items || data.items.length === 0) {
            throw new BadRequestException('GRN must have at least one item');
        }

        // Verify PO exists and is approved
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id: data.purchaseOrderId },
            include: { items: true },
        });

        if (!po) {
            throw new NotFoundException('Purchase Order not found');
        }

        if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
            throw new BadRequestException('Can only create GRN for approved Purchase Orders');
        }

        // Generate GRN number
        const grnNumber = await this.generateGRNNumber();

        // Calculate total quantities for cost breakdown
        const totalReceivedQty = data.items.reduce((sum, item) => sum + item.receivedQty, 0);
        const totalBaseCost = data.items.reduce(
            (sum, item) => sum + item.receivedQty * item.unitCost,
            0,
        );

        // Check for discrepancies
        const hasDiscrepancies = data.items.some(
            (item) => item.rejectedQty && item.rejectedQty > 0,
        );

        // Create GRN with items
        const grn = await this.prisma.goodsReceivingNote.create({
            data: {
                grnNumber,
                purchaseOrderId: data.purchaseOrderId,
                supplierId: data.supplierId,
                receivedDate: data.receivedDate || new Date(),
                receivedByAdminId: data.receivedByAdminId,
                receivedByEmployeeId: data.receivedByEmployeeId,
                inspectionStatus: InspectionStatus.PENDING,
                status: GRNStatus.PENDING,
                hasDiscrepancies,
                notes: data.notes,
                items: {
                    create: data.items.map((item) => {
                        const landedCost = this.calculateLandedCost(
                            item.unitCost,
                            totalReceivedQty,
                            data.costBreakdown,
                        );

                        return {
                            poItemId: item.poItemId,
                            productName: item.productName,
                            productSku: item.productSku,
                            description: item.description,
                            orderedQty: item.orderedQty,
                            receivedQty: item.receivedQty,
                            acceptedQty: item.acceptedQty,
                            rejectedQty: item.rejectedQty || 0,
                            unit: item.unit,
                            unitCost: item.unitCost,
                            landedCost,
                            lineTotal: item.acceptedQty * landedCost,
                            batchNumber: item.batchNumber,
                            serialNumbers: item.serialNumbers,
                            manufacturingDate: item.manufacturingDate,
                            expiryDate: item.expiryDate,
                            locationId: item.locationId,
                            qualityStatus: item.qualityStatus || QualityStatus.ACCEPTED,
                            qualityNotes: item.qualityNotes,
                            damageNotes: item.damageNotes,
                        };
                    }),
                },
                // Create cost breakdown if provided
                ...(data.costBreakdown
                    ? {
                        costBreakdowns: {
                            create: {
                                baseCost: totalBaseCost,
                                shippingCost: data.costBreakdown.shippingCost || 0,
                                customsDuties: data.costBreakdown.customsDuties || 0,
                                insurance: data.costBreakdown.insurance || 0,
                                handlingCharges: data.costBreakdown.handlingCharges || 0,
                                otherFees: data.costBreakdown.otherFees || 0,
                                totalLandedCost:
                                    totalBaseCost +
                                    (data.costBreakdown.shippingCost || 0) +
                                    (data.costBreakdown.customsDuties || 0) +
                                    (data.costBreakdown.insurance || 0) +
                                    (data.costBreakdown.handlingCharges || 0) +
                                    (data.costBreakdown.otherFees || 0),
                                costPerUnit: this.calculateLandedCost(
                                    totalBaseCost / totalReceivedQty,
                                    totalReceivedQty,
                                    data.costBreakdown,
                                ),
                                totalQuantity: totalReceivedQty,
                            },
                        },
                    }
                    : {}),
            },
            include: {
                items: true,
                supplier: true,
                purchaseOrder: {
                    include: {
                        items: true,
                    },
                },
                costBreakdowns: true,
            },
        });

        // Update PO items received quantities
        for (const item of data.items) {
            if (item.poItemId) {
                const poItem = await this.prisma.purchaseOrderItem.findUnique({
                    where: { id: item.poItemId },
                });

                if (poItem) {
                    const newReceivedQty = Number(poItem.receivedQty) + item.acceptedQty;
                    const newRemainingQty = Number(poItem.orderedQty) - newReceivedQty;

                    await this.prisma.purchaseOrderItem.update({
                        where: { id: item.poItemId },
                        data: {
                            receivedQty: newReceivedQty,
                            remainingQty: newRemainingQty,
                            status:
                                newRemainingQty <= 0
                                    ? 'RECEIVED'
                                    : newReceivedQty > 0
                                        ? 'PARTIALLY_RECEIVED'
                                        : 'PENDING',
                        },
                    });
                }
            }
        }

        // Update PO status
        const poItems = await this.prisma.purchaseOrderItem.findMany({
            where: { purchaseOrderId: data.purchaseOrderId },
        });

        const allFullyReceived = poItems.every((item) => Number(item.remainingQty) <= 0);
        const someReceived = poItems.some((item) => Number(item.receivedQty) > 0);

        if (allFullyReceived) {
            await this.prisma.purchaseOrder.update({
                where: { id: data.purchaseOrderId },
                data: { status: 'RECEIVED', closedAt: new Date() },
            });
        } else if (someReceived) {
            await this.prisma.purchaseOrder.update({
                where: { id: data.purchaseOrderId },
                data: { status: 'PARTIALLY_RECEIVED' },
            });
        }

        return grn;
    }

    /**
     * Get all GRNs
     */
    async findAll(filters: any = {}) {
        const { search, status, supplierId, poId, fromDate, toDate, page = 1, limit = 20 } = filters;

        const where: Prisma.GoodsReceivingNoteWhereInput = {};

        if (search) {
            where.OR = [
                { grnNumber: { contains: search } },
                { supplier: { name: { contains: search } } },
                { purchaseOrder: { poNumber: { contains: search } } },
            ];
        }

        if (status) where.status = status;
        if (supplierId) where.supplierId = supplierId;
        if (poId) where.purchaseOrderId = poId;

        if (fromDate || toDate) {
            where.receivedDate = {};
            if (fromDate) where.receivedDate.gte = new Date(fromDate);
            if (toDate) where.receivedDate.lte = new Date(toDate);
        }

        const [grns, total] = await Promise.all([
            this.prisma.goodsReceivingNote.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    supplier: { select: { id: true, name: true, code: true } },
                    purchaseOrder: { select: { id: true, poNumber: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.goodsReceivingNote.count({ where }),
        ]);

        return {
            data: grns,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Get GRN by ID
     */
    async findOne(id: string): Promise<any> {
        const grn = await this.prisma.goodsReceivingNote.findUnique({
            where: { id },
            include: {
                supplier: true,
                purchaseOrder: {
                    include: {
                        items: true,
                    },
                },
                items: {
                    include: {
                        location: true,
                        batches: true,
                    },
                },
                costBreakdowns: true,
                receivedByAdmin: { select: { id: true, adminName: true } },
                receivedByEmployee: {
                    select: { id: true, first_name: true, last_name: true },
                },
            },
        });

        if (!grn) {
            throw new NotFoundException(`GRN with ID ${id} not found`);
        }

        return grn;
    }

    /**
     * Approve GRN and create stock entries
     */
    async approve(id: string, approvedById: string, isAdmin = true): Promise<any> {
        const grn = await this.findOne(id);

        if (grn.status !== GRNStatus.PENDING) {
            throw new BadRequestException('Only pending GRNs can be approved');
        }

        // Create stock entries for each accepted item
        for (const item of grn.items) {
            if (item.acceptedQty > 0) {
                // Create StockIn entry
                const stockIn = await this.prisma.stockIn.create({
                    data: {
                        productName: item.productName,
                        sku: item.productSku,
                        quantity: Number(item.acceptedQty),
                        unit: item.unit as any,
                        unitPrice: Number(item.unitCost),
                        landedCost: Number(item.landedCost),
                        supplier: grn.supplier.name,
                        location: item.location?.name,
                        description: item.description,
                        expiryDate: item.expiryDate,
                        batchNumber: item.batchNumber,
                        serialNumbers: item.serialNumbers,
                        manufacturingDate: item.manufacturingDate,
                        inspectionStatus: grn.inspectionStatus,
                        qualityNotes: item.qualityNotes,
                        stockcategoryId: '00000000-0000-0000-0000-000000000000', // Default - should be provided
                        storeId: '00000000-0000-0000-0000-000000000000', // Default - should be provided
                        grnItemId: item.id,
                    },
                });

                // Link stockIn to GRN item
                await this.prisma.gRNItem.update({
                    where: { id: item.id },
                    data: { stockInId: stockIn.id },
                });

                // Create batch tracking if batch number provided
                if (item.batchNumber) {
                    await this.prisma.batchTracking.create({
                        data: {
                            batchNumber: item.batchNumber,
                            serialNumbers: item.serialNumbers,
                            productName: item.productName,
                            productSku: item.productSku,
                            grnItemId: item.id,
                            manufacturingDate: item.manufacturingDate,
                            expiryDate: item.expiryDate,
                            receivedDate: grn.receivedDate,
                            initialQty: Number(item.acceptedQty),
                            currentQty: Number(item.acceptedQty),
                            consumedQty: 0,
                            unit: item.unit,
                            status: 'ACTIVE',
                            locationId: item.locationId,
                        },
                    });
                }

                // Create stock history entry
                await this.prisma.stockHistory.create({
                    data: {
                        stockInId: stockIn.id,
                        grnId: grn.id,
                        batchNumber: item.batchNumber,
                        movementType: 'IN',
                        sourceType: 'RECEIPT',
                        qtyBefore: 0,
                        qtyChange: Number(item.acceptedQty),
                        qtyAfter: Number(item.acceptedQty),
                        unitPrice: Number(item.unitCost),
                        costAtTransaction: Number(item.landedCost),
                        notes: `Received from GRN ${grn.grnNumber} - PO ${grn.purchaseOrder.poNumber}`,
                    },
                });
            }
        }

        // Update GRN status
        return this.prisma.goodsReceivingNote.update({
            where: { id },
            data: {
                status: GRNStatus.APPROVED,
                approvedAt: new Date(),
                ...(isAdmin ? { approvedByAdminId: approvedById } : { approvedByEmployeeId: approvedById }),
            },
            include: {
                items: true,
                supplier: true,
                purchaseOrder: true,
            },
        });
    }

    /**
     * Reject GRN
     */
    async reject(id: string, reason: string): Promise<any> {
        const grn = await this.findOne(id);

        if (grn.status !== GRNStatus.PENDING) {
            throw new BadRequestException('Only pending GRNs can be rejected');
        }

        return this.prisma.goodsReceivingNote.update({
            where: { id },
            data: {
                status: GRNStatus.REJECTED,
                discrepancyNotes: reason,
            },
        });
    }

    /**
     * Update inspection status
     */
    async updateInspection(
        id: string,
        status: InspectionStatus,
        inspectionNotes?: string,
        qualityNotes?: string,
    ): Promise<any> {
        return this.prisma.goodsReceivingNote.update({
            where: { id },
            data: {
                inspectionStatus: status,
                inspectionDate: new Date(),
                inspectionNotes,
                qualityNotes,
            },
        });
    }
}
