import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseOrder, POStatus, Prisma } from '../../../generated/prisma';

export interface CreatePODto {
    supplierId: string;
    orderDate?: Date;
    expectedDeliveryDate?: Date;
    paymentTerms?: string;
    deliveryTerms?: string;
    notes?: string;
    internalNotes?: string;
    items: CreatePOItemDto[];
    createdByAdminId?: string;
    createdByEmployeeId?: string;
}

export interface CreatePOItemDto {
    productName: string;
    productSku?: string;
    description?: string;
    orderedQty: number;
    unit: string;
    unitPrice: number;
    discountPct?: number;
    taxPct?: number;
}

export interface UpdatePODto extends Partial<Omit<CreatePODto, 'items'>> {
    items?: CreatePOItemDto[];
}

@Injectable()
export class PurchaseOrderService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate unique PO number
     */
    private async generatePONumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `PO-${year}-${month}-`;

        const lastPO = await this.prisma.purchaseOrder.findFirst({
            where: { poNumber: { startsWith: prefix } },
            orderBy: { createdAt: 'desc' },
        });

        const lastNumber = lastPO ? parseInt(lastPO.poNumber.split('-')[3] || '0', 10) : 0;
        const nextNumber = lastNumber + 1;
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    /**
     * Calculate PO totals
     */
    private calculateTotals(items: CreatePOItemDto[], shippingCost = 0, otherCharges = 0) {
        let subtotal = 0;
        let totalTax = 0;

        items.forEach((item) => {
            const itemSubtotal = item.orderedQty * item.unitPrice;
            const discount = item.discountPct ? (itemSubtotal * item.discountPct) / 100 : 0;
            const afterDiscount = itemSubtotal - discount;
            const tax = item.taxPct ? (afterDiscount * item.taxPct) / 100 : 0;

            subtotal += afterDiscount;
            totalTax += tax;
        });

        const grandTotal = subtotal + totalTax + shippingCost + otherCharges;

        return { subtotal, taxAmount: totalTax, grandTotal };
    }

    /**
     * Create Purchase Order
     */
    async create(data: CreatePODto): Promise<PurchaseOrder> {
        if (!data.items || data.items.length === 0) {
            throw new BadRequestException('Purchase Order must have at least one item');
        }

        // Check supplier exists
        const supplier = await this.prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });
        if (!supplier) {
            throw new NotFoundException('Supplier not found');
        }

        // Generate PO number
        const poNumber = await this.generatePONumber();

        // Calculate totals
        const { subtotal, taxAmount, grandTotal } = this.calculateTotals(data.items);

        // Create PO with items
        const po = await this.prisma.purchaseOrder.create({
            data: {
                poNumber,
                supplierId: data.supplierId,
                orderDate: data.orderDate || new Date(),
                expectedDeliveryDate: data.expectedDeliveryDate,
                status: POStatus.DRAFT,
                subtotal,
                taxAmount,
                shippingCost: 0,
                otherCharges: 0,
                grandTotal,
                paymentTerms: data.paymentTerms,
                deliveryTerms: data.deliveryTerms,
                notes: data.notes,
                internalNotes: data.internalNotes,
                createdByAdminId: data.createdByAdminId,
                createdByEmployeeId: data.createdByEmployeeId,
                items: {
                    create: data.items.map((item) => {
                        const itemSubtotal = item.orderedQty * item.unitPrice;
                        const discountAmt = item.discountPct ? (itemSubtotal * item.discountPct) / 100 : 0;
                        const afterDiscount = itemSubtotal - discountAmt;
                        const taxAmt = item.taxPct ? (afterDiscount * item.taxPct) / 100 : 0;

                        return {
                            productName: item.productName,
                            productSku: item.productSku,
                            description: item.description,
                            orderedQty: item.orderedQty,
                            receivedQty: 0,
                            remainingQty: item.orderedQty,
                            unit: item.unit,
                            unitPrice: item.unitPrice,
                            discountPct: item.discountPct || 0,
                            discountAmount: discountAmt,
                            taxPct: item.taxPct || 0,
                            taxAmount: taxAmt,
                            lineTotal: afterDiscount + taxAmt,
                            status: 'PENDING',
                        };
                    }),
                },
            },
            include: {
                items: true,
                supplier: true,
            },
        });

        return po;
    }

    /**
     * Get all Purchase Orders
     */
    async findAll(filters: any = {}) {
        const { search, status, supplierId, fromDate, toDate, page = 1, limit = 20 } = filters;

        const where: Prisma.PurchaseOrderWhereInput = {};

        if (search) {
            where.OR = [
                { poNumber: { contains: search } },
                { supplier: { name: { contains: search } } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (supplierId) {
            where.supplierId = supplierId;
        }

        if (fromDate || toDate) {
            where.orderDate = {};
            if (fromDate) where.orderDate.gte = new Date(fromDate);
            if (toDate) where.orderDate.lte = new Date(toDate);
        }

        const [pos, total] = await Promise.all([
            this.prisma.purchaseOrder.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    supplier: {
                        select: { id: true, name: true, code: true },
                    },
                    _count: {
                        select: { items: true, grns: true },
                    },
                },
            }),
            this.prisma.purchaseOrder.count({ where }),
        ]);

        return {
            data: pos,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Get PO by ID
     */
    async findOne(id: string): Promise<any> {
        const po = await this.prisma.purchaseOrder.findUnique({
            where: { id },
            include: {
                supplier: true,
                items: {
                    include: {
                        grnItems: {
                            include: {
                                grn: {
                                    select: {
                                        id: true,
                                        grnNumber: true,
                                        receivedDate: true,
                                        status: true,
                                    },
                                },
                            },
                        },
                    },
                },
                grns: true,
                createdByAdmin: {
                    select: { id: true, adminName: true },
                },
                createdByEmployee: {
                    select: { id: true, first_name: true, last_name: true },
                },
                approvedByAdmin: {
                    select: { id: true, adminName: true },
                },
            },
        });

        if (!po) {
            throw new NotFoundException(`Purchase Order with ID ${id} not found`);
        }

        return po;
    }

    /**
     * Submit PO for approval
     */
    async submit(id: string): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (po.status !== POStatus.DRAFT) {
            throw new BadRequestException('Only draft POs can be submitted for approval');
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: { status: POStatus.PENDING_APPROVAL },
        });
    }

    /**
     * Approve PO
     */
    async approve(id: string, approvedById: string, isAdmin = true): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (po.status !== POStatus.PENDING_APPROVAL) {
            throw new BadRequestException('Only pending POs can be approved');
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: POStatus.APPROVED,
                approvedAt: new Date(),
                ...(isAdmin
                    ? { approvedByAdminId: approvedById }
                    : { approvedByEmployeeId: approvedById }),
            },
        });
    }

    /**
     * Update PO (only DRAFT status)
     */
    async update(id: string, data: UpdatePODto): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (po.status !== POStatus.DRAFT) {
            throw new BadRequestException('Only draft POs can be updated');
        }

        const updateData: any = {
            supplierId: data.supplierId,
            expectedDeliveryDate: data.expectedDeliveryDate,
            paymentTerms: data.paymentTerms,
            deliveryTerms: data.deliveryTerms,
            notes: data.notes,
            internalNotes: data.internalNotes,
        };

        // If items are updated, recalculate totals
        if (data.items) {
            const { subtotal, taxAmount, grandTotal } = this.calculateTotals(data.items);
            updateData.subtotal = subtotal;
            updateData.taxAmount = taxAmount;
            updateData.grandTotal = grandTotal;

            // Delete old items and create new ones
            await this.prisma.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id },
            });
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                ...updateData,
                ...(data.items
                    ? {
                        items: {
                            create: data.items.map((item) => {
                                const itemSubtotal = item.orderedQty * item.unitPrice;
                                const discountAmt = item.discountPct
                                    ? (itemSubtotal * item.discountPct) / 100
                                    : 0;
                                const afterDiscount = itemSubtotal - discountAmt;
                                const taxAmt = item.taxPct ? (afterDiscount * item.taxPct) / 100 : 0;

                                return {
                                    productName: item.productName,
                                    productSku: item.productSku,
                                    description: item.description,
                                    orderedQty: item.orderedQty,
                                    receivedQty: 0,
                                    remainingQty: item.orderedQty,
                                    unit: item.unit,
                                    unitPrice: item.unitPrice,
                                    discountPct: item.discountPct || 0,
                                    discountAmount: discountAmt,
                                    taxPct: item.taxPct || 0,
                                    taxAmount: taxAmt,
                                    lineTotal: afterDiscount + taxAmt,
                                    status: 'PENDING',
                                };
                            }),
                        },
                    }
                    : {}),
            },
            include: {
                items: true,
                supplier: true,
            },
        });
    }

    /**
     * Cancel PO
     */
    async cancel(id: string, reason: string): Promise<PurchaseOrder> {
        const po = await this.findOne(id);

        if (![POStatus.DRAFT, POStatus.PENDING_APPROVAL, POStatus.APPROVED].includes(po.status)) {
            throw new BadRequestException('Cannot cancel PO in current status');
        }

        // Check if any items have been received
        const receivedCount = await this.prisma.gRNItem.count({
            where: {
                grn: {
                    purchaseOrderId: id,
                },
            },
        });

        if (receivedCount > 0) {
            throw new BadRequestException('Cannot cancel PO with received items');
        }

        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                status: POStatus.CANCELLED,
                cancelledAt: new Date(),
                cancellationReason: reason,
            },
        });
    }

    /**
     * Delete PO (only DRAFT)
     */
    async remove(id: string): Promise<void> {
        const po = await this.findOne(id);

        if (po.status !== POStatus.DRAFT) {
            throw new BadRequestException('Only draft POs can be deleted');
        }

        await this.prisma.purchaseOrder.delete({ where: { id } });
    }
}
