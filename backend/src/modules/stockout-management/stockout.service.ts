import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateStockSKU } from 'src/common/utils/generate-sku.util';
import { generateAndSaveBarcodeImage } from 'src/common/utils/generate-barcode.util';

@Injectable()
export class StockoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    sales: {
      stockinId: number; // now an integer
      quantity: number;
      soldPrice?: number;
    }[];
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    paymentMethod?;
    adminId?: string;
    employeeId?: string;
  }) {
    const {
      sales,
      adminId,
      employeeId,
      clientEmail,
      clientName,
      clientPhone,
      paymentMethod,
    } = data;

    if (!Array.isArray(sales) || sales.length === 0) {
      throw new BadRequestException('At least one sale is required');
    }

    if (!adminId) {
      throw new BadRequestException('Admin ID is missing');
    }

    const transactionId = generateStockSKU('abyride', 'transaction');
    const createdStockouts: any[] = [];

    return await this.prisma.$transaction(async (tx) => {
      for (const sale of sales) {
        const { stockinId, quantity, soldPrice: overrideSoldPrice } = sale;

        if (!stockinId) {
          throw new BadRequestException('Stock ID is required for sales');
        }

        // Fetch Stock details
        const stock = await tx.stock.findUnique({
          where: { id: stockinId },
        });

        if (!stock) {
          throw new NotFoundException(`Stock not found for ID: ${stockinId}`);
        }

        if (stock.receivedQuantity < quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${stock.itemName}". Available: ${stock.receivedQuantity}, Requested: ${quantity}`,
          );
        }

        if (!stock.unitCost) {
          throw new BadRequestException(
            `Unit cost not set for stock "${stock.itemName}"`,
          );
        }

        // Decrement Stock quantity
        const updatedStock = await tx.stock.updateMany({
          where: { id: stockinId, receivedQuantity: { gte: quantity } },
          data: { receivedQuantity: { decrement: quantity } },
        });

        if (updatedStock.count === 0) {
          throw new BadRequestException(
            `Failed to decrement stock for "${stock.itemName}"`,
          );
        }

        const soldPrice = overrideSoldPrice ?? stock.unitCost;

        // Create StockOut record
        const newStockout = await tx.stockOut.create({
          data: {
            stockinId,
            quantity,
            soldPrice,
            clientName,
            clientEmail,
            clientPhone,
            adminId,
            employeeId,
            transactionId,
            paymentMethod,
          },
        });

        createdStockouts.push(newStockout);
      }

      // Generate barcode for transaction
      await generateAndSaveBarcodeImage(String(transactionId));

      return {
        message: 'Stock out transaction completed successfully',
        transactionId,
        data: createdStockouts,
      };
    });
  }

  async getAll(adminId: string) {
    if (!adminId) {
      throw new BadRequestException('Admin ID is missing');
    }

    return this.prisma.stockOut.findMany({
      where: { adminId },
      include: {
        stockin: true, // includes all stock details
        admin: true,
        employee: true,
      },
    });
  }

  async getOne(id: string) {
    const stockout = await this.prisma.stockOut.findUnique({
      where: { id },
      include: {
        stockin: true,
        admin: true,
        employee: true,
      },
    });

    if (!stockout) throw new NotFoundException('StockOut not found');
    return stockout;
  }

  async getStockOutByTransactionId(transactionId: string) {
    if (!transactionId) {
      throw new HttpException(
        'Transaction ID is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.stockOut.findMany({
      where: { transactionId },
      include: {
        stockin: true,
        admin: true,
        employee: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      quantity: number;
      soldPrice: number;
      clientName: string;
      clientEmail: string;
      clientPhone: string;
      adminId: string;
      employeeId: string;
    }>,
  ) {
    const stockout = await this.prisma.stockOut.findUnique({ where: { id } });
    if (!stockout) throw new NotFoundException('StockOut not found');

    return this.prisma.stockOut.update({
      where: { id },
      data: {
        quantity: data.quantity ?? stockout.quantity,
        soldPrice: data.soldPrice ?? stockout.soldPrice,
        clientName: data.clientName ?? stockout.clientName,
        clientEmail: data.clientEmail ?? stockout.clientEmail,
        clientPhone: data.clientPhone ?? stockout.clientPhone,
        adminId: data.adminId ?? stockout.adminId,
        employeeId: data.employeeId ?? stockout.employeeId,
      },
    });
  }

  async delete(id: string) {
    const stockout = await this.prisma.stockOut.findUnique({ where: { id } });
    if (!stockout) throw new NotFoundException('StockOut not found');

    // Restore Stock quantity
    if (stockout.stockinId && stockout.quantity > 0) {
      await this.prisma.stock.update({
        where: { id: stockout.stockinId },
        data: { receivedQuantity: { increment: stockout.quantity } },
      });
    }

    return this.prisma.stockOut.delete({ where: { id } });
  }
}
