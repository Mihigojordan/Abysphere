import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateStockSKU } from 'src/common/utils/generate-sku.util';
import { Prisma } from 'generated/prisma';

@Injectable()
export class SalesReturnService {
  constructor(private readonly prisma: PrismaService) { }

  // Create a new sales return
  async create(data: {
    transactionId: string;
    reason?: string;
    createdAt?: Date;
    items: { stockoutId: string; quantity: number }[];
    adminId: string;
    employeeId?: string;
  }) {
    const { transactionId, reason, createdAt, items, adminId, employeeId } = data;

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one item must be provided');
    }

    if (!adminId) {
      throw new BadRequestException('Admin ID is missing');
    }

    const creditnoteId = generateStockSKU('CR', 'NOTE');

    // Create SalesReturn record
    const salesReturn = await this.prisma.salesReturn.create({
      data: {
        transactionId,
        reason,
        creditnoteId,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        adminId,
      },
    });

    const success: { stockoutId: string; itemId: string }[] = [];
    const errors: { stockoutId: string; error: string }[] = [];

    for (const item of items) {
      const { stockoutId, quantity } = item;

      try {
        const stockout = await this.prisma.stockOut.findUnique({
          where: { id: stockoutId },
        });

        if (!stockout) throw new Error('Invalid stockoutId');

        if (quantity > (stockout.quantity ?? 0)) {
          throw new Error(
            `Returned quantity ${quantity} exceeds stockout quantity ${stockout.quantity ?? 0}`,
          );
        }

        if (stockout.stockinId) {
          const stock = await this.prisma.stock.findUnique({
            where: { id: stockout.stockinId },
          });

          if (!stock) throw new Error('Related stock not found');

          const oldQty = Number(stock.receivedQuantity) || 0;
          const newQty = oldQty + quantity;

          // Restore stock quantity
          await this.prisma.stock.update({
            where: { id: stock.id },
            data: {
              receivedQuantity: newQty,
            },
          });

          // Record stock history — IN (sales return)
          await this.prisma.stockHistory.create({
            data: {
              stockId: stock.id,
              movementType: 'IN',
              sourceType: 'RECEIPT',
              qtyBefore: new Prisma.Decimal(oldQty),
              qtyChange: new Prisma.Decimal(quantity),
              qtyAfter: new Prisma.Decimal(newQty),
              unitPrice: stockout.soldPrice ? new Prisma.Decimal(Number(stockout.soldPrice)) : null,
              notes: `Sales return: ${stock.itemName} +${quantity} (CreditNote: ${creditnoteId})`,
              createdByAdminId: adminId,
              createdByEmployeeId: employeeId || null,
            },
          });
        }

        // Reduce StockOut quantity
        await this.prisma.stockOut.update({
          where: { id: stockout.id },
          data: {
            quantity: (stockout.quantity ?? 0) - quantity,
          },
        });

        // Create SalesReturnItem
        const returnItem = await this.prisma.salesReturnItem.create({
          data: {
            salesReturnId: salesReturn.id,
            stockoutId,

            quantity,
          },
        });

        success.push({ stockoutId, itemId: returnItem.id });
      } catch (error) {
        errors.push({ stockoutId, error: error.message });
      }
    }

    // Fetch updated sales return with stock details
    const updatedSalesReturn = await this.prisma.salesReturn.findUnique({
      where: { id: salesReturn.id },
      include: {
        items: {
          include: {
            stockout: {
              include: {
                stockin: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Sales return processed',
      transactionId,
      salesReturn: updatedSalesReturn,
      success,
      errors,
    };
  }

  // Get all sales returns for an admin
  async findAll(adminId: string) {
    if (!adminId) throw new BadRequestException('Admin ID is missing');

    const returns = await this.prisma.salesReturn.findMany({
      where: { adminId },
      include: {
        items: {
          include: {
            stockout: {
              include: {
                stockin: true,
              },
            },
          },
        },
      },
    });

    return {
      message: 'Sales returns retrieved successfully',
      data: returns,
    };
  }

  // Get a single sales return by ID
  async findOne(id: string) {
    if (!id) throw new BadRequestException('ID is required');

    const salesReturn = await this.prisma.salesReturn.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            stockout: {
              include: {
                stockin: true,
              },
            },
          },
        },
      },
    });

    if (!salesReturn) throw new NotFoundException('Sales return not found');

    return {
      message: 'Sales return retrieved successfully',
      data: salesReturn,
    };
  }
}
