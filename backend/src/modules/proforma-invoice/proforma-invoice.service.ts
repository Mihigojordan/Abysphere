import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProformaStatus, Prisma } from '../../../generated/prisma';
import { generateStockSKU } from 'src/common/utils/generate-sku.util';

export interface CreateProformaDto {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    expiryDate?: Date;
    paymentTerms?: string;
    notes?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    items: CreateProformaItemDto[];
    createdByAdminId?: string;
    createdByEmployeeId?: string;
}

export interface CreateProformaItemDto {
    stockId?: number;
    productName: string;
    productSku?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPct?: number;
    taxPct?: number;
}

export interface UpdateProformaDto extends Partial<Omit<CreateProformaDto, 'items'>> {
    items?: CreateProformaItemDto[];
}

@Injectable()
export class ProformaInvoiceService {
    constructor(private readonly prisma: PrismaService) { }

    private async generateProformaNumber(): Promise<string> {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `PI-${year}-${month}-`;

        const lastPI = await this.prisma.proformaInvoice.findFirst({
            where: { proformaNumber: { startsWith: prefix } },
            orderBy: { createdAt: 'desc' },
        });

        const lastNumber = lastPI ? parseInt(lastPI.proformaNumber.split('-')[3] || '0', 10) : 0;
        const nextNumber = lastNumber + 1;
        return `${prefix}${String(nextNumber).padStart(4, '0')}`;
    }

    private calculateTotals(items: CreateProformaItemDto[], discountType?: string, discountValue = 0) {
        let subtotal = 0;
        let totalTax = 0;

        items.forEach((item) => {
            const itemSubtotal = Number(item.quantity) * Number(item.unitPrice);
            const discount = item.discountPct ? (itemSubtotal * Number(item.discountPct)) / 100 : 0;
            const afterDiscount = itemSubtotal - discount;
            const tax = item.taxPct ? (afterDiscount * Number(item.taxPct)) / 100 : 0;

            subtotal += afterDiscount;
            totalTax += tax;
        });

        let finalGrandTotal = subtotal + totalTax;
        if (discountType === 'PERCENTAGE') {
            finalGrandTotal -= (subtotal * Number(discountValue)) / 100;
        } else if (discountType === 'FIXED') {
            finalGrandTotal -= Number(discountValue);
        }

        return { subtotal, taxAmount: totalTax, grandTotal: Math.max(0, finalGrandTotal) };
    }

    async create(data: CreateProformaDto) {
        if (!data.items || data.items.length === 0) {
            throw new BadRequestException('Proforma Invoice must have at least one item');
        }

        const proformaNumber = await this.generateProformaNumber();
        const { subtotal, taxAmount, grandTotal } = this.calculateTotals(data.items, data.discountType, data.discountValue);

        return this.prisma.proformaInvoice.create({
            data: {
                proformaNumber,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                paymentTerms: data.paymentTerms,
                notes: data.notes,
                status: ProformaStatus.DRAFT,
                subtotal,
                taxAmount,
                discountType: data.discountType,
                discountValue: data.discountValue || 0,
                grandTotal,
                createdByAdminId: data.createdByAdminId,
                createdByEmployeeId: data.createdByEmployeeId,
                items: {
                    create: data.items.map((item) => {
                        const itemSubtotal = Number(item.quantity) * Number(item.unitPrice);
                        const discount = item.discountPct ? (itemSubtotal * Number(item.discountPct)) / 100 : 0;
                        const afterDiscount = itemSubtotal - discount;
                        const tax = item.taxPct ? (afterDiscount * Number(item.taxPct)) / 100 : 0;
                        const totalPrice = afterDiscount + tax;

                        return {
                            stockId: item.stockId,
                            productName: item.productName,
                            productSku: item.productSku,
                            description: item.description,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            discountPct: item.discountPct || 0,
                            taxPct: item.taxPct || 0,
                            totalPrice,
                        };
                    }),
                },
            },
            include: { items: true },
        });
    }

    async findAll(filters: any) {
        const { status, search, fromDate, toDate } = filters;
        const where: Prisma.ProformaInvoiceWhereInput = {};

        if (status) where.status = status;
        if (search) {
            where.OR = [
                { proformaNumber: { contains: search } },
                { clientName: { contains: search } },
                { clientEmail: { contains: search } },
            ];
        }
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate) where.createdAt.gte = new Date(fromDate);
            if (toDate) where.createdAt.lte = new Date(toDate);
        }

        return this.prisma.proformaInvoice.findMany({
            where,
            include: {
                items: true,
                createdByAdmin: { select: { id: true, adminName: true } },
                createdByEmployee: { select: { id: true, first_name: true, last_name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const proforma = await this.prisma.proformaInvoice.findUnique({
            where: { id },
            include: {
                items: { include: { stock: true } },
                createdByAdmin: true,
                createdByEmployee: true,
                approvedByAdmin: true,
                approvedByEmployee: true,
            },
        });

        if (!proforma) throw new NotFoundException('Proforma Invoice not found');
        return proforma;
    }

    async update(id: string, data: UpdateProformaDto) {
        const proforma = await this.findOne(id);
        if (proforma.status !== ProformaStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT proforma invoices can be updated');
        }

        const { subtotal, taxAmount, grandTotal } = this.calculateTotals(
            data.items || proforma.items as any,
            data.discountType || proforma.discountType as any,
            data.discountValue ?? Number(proforma.discountValue)
        );

        return this.prisma.$transaction(async (tx) => {
            if (data.items) {
                await tx.proformaInvoiceItem.deleteMany({ where: { proformaInvoiceId: id } });
            }

            return tx.proformaInvoice.update({
                where: { id },
                data: {
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                    paymentTerms: data.paymentTerms,
                    notes: data.notes,
                    subtotal,
                    taxAmount,
                    discountType: data.discountType,
                    discountValue: data.discountValue,
                    grandTotal,
                    items: data.items ? {
                        create: data.items.map((item) => {
                            const itemSubtotal = Number(item.quantity) * Number(item.unitPrice);
                            const discount = item.discountPct ? (itemSubtotal * Number(item.discountPct)) / 100 : 0;
                            const afterDiscount = itemSubtotal - discount;
                            const tax = item.taxPct ? (afterDiscount * Number(item.taxPct)) / 100 : 0;
                            const totalPrice = afterDiscount + tax;

                            return {
                                stockId: item.stockId,
                                productName: item.productName,
                                productSku: item.productSku,
                                description: item.description,
                                quantity: Number(item.quantity),
                                unitPrice: Number(item.unitPrice),
                                discountPct: item.discountPct || 0,
                                taxPct: item.taxPct || 0,
                                totalPrice,
                            };
                        }),
                    } : undefined,
                },
                include: { items: true },
            });
        });
    }

    async submit(id: string) {
        const proforma = await this.findOne(id);
        if (proforma.status !== ProformaStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT proforma invoices can be submitted');
        }

        return this.prisma.proformaInvoice.update({
            where: { id },
            data: { status: ProformaStatus.SENT },
        });
    }

    async markAsPaid(id: string, adminId: string, employeeId?: string) {
        const proforma = await this.findOne(id);
        if (proforma.status !== ProformaStatus.SENT) {
            throw new BadRequestException('Only SENT proforma invoices can be marked as paid');
        }

        return this.prisma.$transaction(async (tx) => {
            const updatedProforma = await tx.proformaInvoice.update({
                where: { id },
                data: {
                    status: ProformaStatus.PAID,
                    paidAt: new Date(),
                    approvedByAdminId: adminId,
                    approvedByEmployeeId: employeeId,
                },
            });

            const transactionId = generateStockSKU('ABY', 'SALE');

            for (const item of proforma.items) {
                if (item.stockId) {
                    const stock = await tx.stock.findUnique({ where: { id: item.stockId } });
                    if (!stock) throw new NotFoundException(`Stock item "${item.productName}" not found`);

                    if (Number(stock.receivedQuantity) < Number(item.quantity)) {
                        throw new BadRequestException(`Insufficient stock for "${item.productName}". Available: ${stock.receivedQuantity}, Required: ${item.quantity}`);
                    }

                    await tx.stock.update({
                        where: { id: item.stockId },
                        data: { receivedQuantity: { decrement: Number(item.quantity) } },
                    });

                    await tx.stockOut.create({
                        data: {
                            stockinId: item.stockId,
                            quantity: Number(item.quantity),
                            soldPrice: Number(item.unitPrice),
                            clientName: proforma.clientName,
                            clientEmail: proforma.clientEmail,
                            clientPhone: proforma.clientPhone,
                            paymentMethod: 'CASH',
                            transactionId,
                            adminId,
                            employeeId,
                        }
                    });

                    await tx.stockHistory.create({
                        data: {
                            stockId: item.stockId,
                            movementType: 'OUT',
                            sourceType: 'ISSUE',
                            qtyBefore: Number(stock.receivedQuantity),
                            qtyChange: Number(item.quantity),
                            qtyAfter: Number(stock.receivedQuantity) - Number(item.quantity),
                            notes: `Proforma Invoice ${proforma.proformaNumber} Paid`,
                            createdByAdminId: adminId,
                            createdByEmployeeId: employeeId,
                        }
                    });
                }
            }

            return updatedProforma;
        });
    }

    async cancel(id: string, reason: string) {
        const proforma = await this.findOne(id);
        if (proforma.status === ProformaStatus.PAID) {
            throw new BadRequestException('PAID proforma invoices cannot be cancelled');
        }

        return this.prisma.proformaInvoice.update({
            where: { id },
            data: {
                status: ProformaStatus.CANCELLED,
                cancelledAt: new Date(),
                cancellationReason: reason,
            },
        });
    }

    async remove(id: string) {
        const proforma = await this.findOne(id);
        if (proforma.status !== ProformaStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT proforma invoices can be deleted');
        }

        return this.prisma.proformaInvoice.delete({ where: { id } });
    }
}
