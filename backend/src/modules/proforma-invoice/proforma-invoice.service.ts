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

const LOGO_URL = `${process.env.FRONTEND_URL_ONLY}/erasebg-transformed.png`;
const WATERMARK_URL = `${process.env.FRONTEND_URL_ONLY}/erasebg-transformed.png`;
const COMPANY_SEAL_URL = `${process.env.FRONTEND_URL_ONLY}/company_seal.png`;

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
            const taxPct = (item.taxPct === undefined || item.taxPct === null) ? 18 : Number(item.taxPct);
            const tax = (afterDiscount * taxPct) / 100;

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
                        const taxPct = (item.taxPct === undefined || item.taxPct === null) ? 18 : Number(item.taxPct);
                        const tax = (afterDiscount * taxPct) / 100;
                        const totalPrice = afterDiscount + tax;

                        return {
                            stockId: item.stockId,
                            productName: item.productName,
                            productSku: item.productSku,
                            description: item.description,
                            quantity: Number(item.quantity),
                            unitPrice: Number(item.unitPrice),
                            discountPct: item.discountPct || 0,
                            taxPct: taxPct,
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
                            const taxPct = (item.taxPct === undefined || item.taxPct === null) ? 18 : Number(item.taxPct);
                            const tax = (afterDiscount * taxPct) / 100;
                            const totalPrice = afterDiscount + tax;

                            return {
                                stockId: item.stockId,
                                productName: item.productName,
                                productSku: item.productSku,
                                description: item.description,
                                quantity: Number(item.quantity),
                                unitPrice: Number(item.unitPrice),
                                discountPct: item.discountPct || 0,
                                taxPct: taxPct,
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
    const fmtCur = (n: any) => `RWF ${Number(n || 0).toLocaleString('en-US')}`;
    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const itemRows = (proforma.items || []).map((item: any) => `
        <tr>
            <td><span class="td-sku">${item.productSku || 'N/A'}</span></td>
            <td><p class="td-name">${item.productName}</p></td>
            <td><p class="td-qty">${item.quantity}</p></td>
            <td class="td-price">${fmtCur(item.unitPrice)}</td>
            <td class="td-total">${fmtCur(item.totalPrice)}</td>
        </tr>`).join('');

    const discountLine = Number(proforma.discountValue) > 0 ? `
        <div class="totals-row">
            <span class="lbl">Discount (${proforma.discountType || 'FIXED'})</span>
            <span class="val">− ${fmtCur(proforma.discountValue)}</span>
        </div>` : '';

  
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Proforma Invoice ${proforma.proformaNumber}</title>
<style>
    body {
        margin: 0; padding: 0;
        background: #dde3ec;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #0f172a;
        -webkit-font-smoothing: antialiased;
    }
    .sheet {
        background: #ffffff;
        max-width: 880px;
        margin: 48px auto;
        box-shadow: 0 8px 48px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
        overflow: hidden;
    }
    .letterhead-bar {
        height: 8px;
        background: linear-gradient(to right, #1e5fa8 0%, #1e5fa8 70%, #5fa3e8 70%, #5fa3e8 100%);
    }
    .doc { padding: 56px 64px; position: relative; }
    .doc-content { position: relative; z-index: 1; }
    .watermark {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.06; width: 500px;
        pointer-events: none; z-index: 0; object-fit: contain;
    }
    table { width: 100%; border-collapse: collapse; }
    .head { padding-bottom: 40px; border-bottom: 1px solid #e2e8f0; }
    .brand-logo { height: 52px; width: auto; object-fit: contain; }
    .brand-tagline { font-size: 11px; font-style: italic; color: #5fa3e8; margin: 4px 0 16px; }
    .company-meta { display: block; margin-top: 10px; }
    .meta-row { font-size: 9px; color: #475569; font-weight: 400; margin-bottom: 3px; }
    .meta-tin { margin-top: 5px; padding-top: 5px; border-top: 1px solid #e2e8f0; font-size: 9px; font-weight: 600; color: #0f172a; }
    .po-block { text-align: right; }
    .po-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1e5fa8; margin: 0 0 4px; }
    .po-number { font-family: Georgia, serif; font-size: 40px; line-height: 1; color: #0f172a; letter-spacing: -.02em; margin: 0 0 16px; }
    .po-date-row { font-size: 10px; color: #475569; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 4px; }
    .parties { padding: 36px 0; border-bottom: 1px solid #e2e8f0; }
    .party-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #94a3b8; margin: 0 0 12px; }
    .party-name { font-family: Georgia, serif; font-size: 18px; color: #0f172a; margin: 0 0 8px; line-height: 1.2; }
    .party-detail { font-size: 11px; color: #475569; line-height: 1.8; margin: 0; }
    .items-section { padding: 36px 0; border-bottom: 1px solid #e2e8f0; }
    .section-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #94a3b8; margin: 0 0 16px; }
    .items-table thead tr { border-bottom: 2px solid #0f172a; }
    .items-table th { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; padding: 0 0 10px; text-align: left; }
    .items-table th.right { text-align: right; }
    .items-table th.center { text-align: center; }
    .items-table tbody tr { border-bottom: 1px solid #e2e8f0; }
    .items-table td { padding: 16px 0; vertical-align: top; }
    .td-sku { font-family: monospace; font-size: 10px; font-weight: 500; color: #475569; background: #f8fafc; padding: 3px 7px; border-radius: 3px; display: inline-block; }
    .td-name { font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.3; margin: 0; }
    .td-qty { font-size: 12px; font-weight: 500; text-align: center; color: #0f172a; margin: 0; }
    .td-price { font-family: monospace; font-size: 11px; color: #475569; text-align: right; }
    .td-total { font-family: monospace; font-size: 12px; font-weight: 500; color: #0f172a; text-align: right; }
    .footer-section { padding-top: 36px; }
    .company-seal-large { width: 100%; max-width: 420px; height: auto; object-fit: contain; opacity: 0.92; }
    .totals-row { padding: 6px 0; font-size: 11px; color: #475569; font-weight: 500; text-align: right; }
    .totals-row .lbl { padding-right: 24px; display: inline-block; }
    .totals-row .val { display: inline-block; width: 120px; text-align: right; }
    .totals-row.grand { margin-top: 12px; padding-top: 16px; border-top: 2px solid #0f172a; }
    .totals-row.grand .lbl { font-size: 11px; font-weight: 700; color: #0f172a; letter-spacing: .06em; text-transform: uppercase; }
    .totals-row.grand .val { font-size: 22px; font-family: Georgia, serif; color: #1e5fa8; letter-spacing: -.02em; }
    .doc-foot { background: #0f172a; padding: 16px 64px; }
    .doc-foot p { font-size: 8px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.35); margin: 0; }
</style>
</head>
<body>
    <div class="sheet">
        <div class="letterhead-bar"></div>
        <div class="doc">
            <img src="${WATERMARK_URL}" alt="" class="watermark" />
            <div class="doc-content">
                <table class="head">
                    <tr>
                        <td valign="top">
                            <img src="${LOGO_URL}" alt="PMS Logo" class="brand-logo" />
                            <p class="brand-tagline">Customer is an asset</p>
                            <div class="company-meta">
                                <div class="meta-row">Kigali, Rwanda</div>
                                <div class="meta-row">0784544729 / 0788347094</div>
                                <div class="meta-row">papemessenger@gmail.com</div>
                                <div class="meta-row">Acc BK: 00048-06952213-37 &nbsp;|&nbsp; Acc KCB: 4490862733</div>
                                <div class="meta-tin">TIN: &nbsp;107510116</div>
                            </div>
                        </td>
                        <td valign="top" class="po-block">
                            <p class="po-label">Proforma Invoice</p>
                            <p class="po-number">#${proforma.proformaNumber}</p>
                            <div class="po-date-row"><span>Date:</span> ${fmtDate(proforma.issueDate || proforma.createdAt)}</div>
                            ${proforma.expiryDate ? `<div class="po-date-row"><span>Expires:</span> ${fmtDate(proforma.expiryDate)}</div>` : ''}
                            <div style="margin-top: 12px; display: inline-block; padding: 4px 10px; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; border-radius: 2px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">
                                SENT
                            </div>
                        </td>
                    </tr>
                </table>

                <table class="parties">
                    <tr>
                        <td valign="top" width="50%">
                            <p class="party-label">Bill To</p>
                            <p class="party-name">${proforma.clientName}</p>
                            <p class="party-detail">
                                ${proforma.clientEmail ? `${proforma.clientEmail}<br />` : ''}
                                ${proforma.clientPhone ? `${proforma.clientPhone}` : ''}
                            </p>
                        </td>
                        <td valign="top" width="50%" style="padding-left: 20px;">
                            <p class="party-label">Issued By</p>
                            <p class="party-name">PAPETERIE MESSENGER SUPPLY Ltd</p>
                            <p class="party-detail">
                                Kigali, Rwanda<br />
                                papemessenger@gmail.com<br />
                                0784544729 / 0788347094
                            </p>
                        </td>
                    </tr>
                </table>

                <div class="items-section">
                    <p class="section-label">Items</p>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th style="width: 100px;">SKU</th>
                                <th>Description</th>
                                <th class="center" style="width: 90px;">Qty</th>
                                <th class="right" style="width: 130px;">Unit Price</th>
                                <th class="right" style="width: 140px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemRows}
                        </tbody>
                    </table>
                </div>

                <table class="footer-section">
                    <tr>
                        <td valign="top" width="60%">
                            <img src="${COMPANY_SEAL_URL}" alt="Company Seal" class="company-seal-large" />
                        </td>
                        <td valign="top" width="40%">
                            <div class="totals-row">
                                <span class="lbl">Subtotal</span>
                                <span class="val">${fmtCur(proforma.subtotal)}</span>
                            </div>
                            <div class="totals-row">
                                <span class="lbl">VAT (18%)</span>
                                <span class="val">${fmtCur(proforma.taxAmount)}</span>
                            </div>
                            ${discountLine}
                            <div class="totals-row grand">
                                <span class="lbl">Grand Total</span>
                                <span class="val">${fmtCur(proforma.grandTotal)}</span>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="letterhead-bar"></div>
        <div class="doc-foot">
            <table width="100%">
                <tr>
                    <td align="left"><p>System Generated · PMS ERP v2.0</p></td>
                    <td align="right"><p>papmes.com &nbsp;|&nbsp; papemessenger@gmail.com</p></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>`;
}
}
