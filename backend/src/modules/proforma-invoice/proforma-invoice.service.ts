import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProformaStatus, Prisma } from '../../../generated/prisma';
import { generateStockSKU } from 'src/common/utils/generate-sku.util';
import { EmailService } from 'src/global/email/email.service';

export interface CreateProformaDto {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientId?: string;
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
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService,
    ) { }

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
                clientId: data.clientId || null,
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
                    clientId: data.clientId !== undefined ? (data.clientId || null) : undefined,
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

    async sendByEmail(id: string, emailOverride?: string) {
        const proforma = await this.findOne(id);

        if (proforma.status !== ProformaStatus.DRAFT) {
            throw new BadRequestException('Only DRAFT proforma invoices can be sent');
        }

        const toEmail = emailOverride || proforma.clientEmail;
        if (!toEmail) {
            throw new BadRequestException('No email address available for this client');
        }

        // If caller provided an email override, persist it on the proforma and the linked client
        if (emailOverride) {
            await this.prisma.proformaInvoice.update({
                where: { id },
                data: { clientEmail: emailOverride },
            });
            if (proforma.clientId) {
                await this.prisma.client.update({
                    where: { id: proforma.clientId },
                    data: { email: emailOverride },
                });
            }
        }

        const html = this.buildProformaEmailHtml(proforma);
        await this.emailService.sendRawEmail(
            toEmail,
            `Proforma Invoice ${proforma.proformaNumber}`,
            html,
        );

        return this.prisma.proformaInvoice.update({
            where: { id },
            data: { status: ProformaStatus.SENT },
        });
    }

    private buildProformaEmailHtml(proforma: any): string {
        const fmt = (n: any) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

        const itemRows = (proforma.items || []).map((item: any) => `
            <tr>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#1e293b;">${item.productName}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b;">${item.quantity}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b;">${fmt(item.unitPrice)}</td>
                <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#1e293b;font-weight:600;">${fmt(item.totalPrice)}</td>
            </tr>`).join('');

        const discountLine = Number(proforma.discountValue) > 0 ? `
            <tr>
                <td colspan="3" style="padding:6px 12px;text-align:right;color:#64748b;">Discount</td>
                <td style="padding:6px 12px;text-align:right;color:#dc2626;">- ${fmt(proforma.discountValue)}</td>
            </tr>` : '';

        const taxLine = Number(proforma.taxAmount) > 0 ? `
            <tr>
                <td colspan="3" style="padding:6px 12px;text-align:right;color:#64748b;">Tax</td>
                <td style="padding:6px 12px;text-align:right;color:#64748b;">+ ${fmt(proforma.taxAmount)}</td>
            </tr>` : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Proforma Invoice ${proforma.proformaNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6ff;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(29,78,216,0.12);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:36px 32px;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.15em;color:#bfdbfe;text-transform:uppercase;">Papeterie Messenger Supply Ltd</p>
            <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;">Proforma Invoice</h1>
            <p style="margin:0;font-size:14px;color:#93c5fd;font-weight:600;">${proforma.proformaNumber}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px;">

            <!-- Greeting -->
            <p style="margin:0 0 24px;font-size:15px;color:#1e293b;">Dear <strong>${proforma.clientName}</strong>,</p>
            <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
              Please find below your proforma invoice summary. This document is valid until the expiry date shown.
            </p>

            <!-- Invoice details card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #bfdbfe;">
                  <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Invoice #</span>
                  <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${proforma.proformaNumber}</p>
                </td>
                <td style="padding:14px 16px;border-bottom:1px solid #bfdbfe;border-left:1px solid #bfdbfe;">
                  <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Issue Date</span>
                  <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${fmtDate(proforma.issueDate)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 16px;">
                  <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Expiry Date</span>
                  <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${fmtDate(proforma.expiryDate)}</p>
                </td>
                <td style="padding:14px 16px;border-left:1px solid #bfdbfe;">
                  <span style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Payment Terms</span>
                  <p style="margin:2px 0 0;font-size:14px;font-weight:600;color:#1e293b;">${proforma.paymentTerms || 'COD'}</p>
                </td>
              </tr>
            </table>

            <!-- Items table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
              <thead>
                <tr style="background:#1e3a8a;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#bfdbfe;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Product</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#bfdbfe;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#bfdbfe;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Unit Price</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#bfdbfe;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Total</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding:8px 12px;text-align:right;color:#64748b;border-top:1px solid #e2e8f0;">Subtotal</td>
                  <td style="padding:8px 12px;text-align:right;border-top:1px solid #e2e8f0;">${fmt(proforma.subtotal)}</td>
                </tr>
                ${discountLine}
                ${taxLine}
                <tr style="background:#f0f6ff;">
                  <td colspan="3" style="padding:12px;text-align:right;font-weight:700;color:#1e3a8a;font-size:15px;">Grand Total</td>
                  <td style="padding:12px;text-align:right;font-weight:700;color:#2563eb;font-size:17px;">${fmt(proforma.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>

            ${proforma.notes ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b;background:#f0f6ff;border:1px solid #bfdbfe;border-radius:6px;padding:12px;"><strong>Note:</strong> ${proforma.notes}</p>` : ''}

          </td>
        </tr>

        <!-- Footer notice -->
        <tr>
          <td style="background:#f0f6ff;padding:20px 32px;border-top:1px solid #bfdbfe;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-style:italic;">
              This is a proforma invoice and is not a tax invoice. Payment is not due until a formal invoice is issued.
            </p>
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} Papeterie Messenger Supply Ltd · This is an automated message, please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }
}
