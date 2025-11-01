import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async createStock(data: any, adminId: string) {
  let supplierName: string | null = null;

  if (data.supplier && typeof data.supplier === 'string' && data.supplier.length === 36) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplier } });
    if (!supplier) throw new NotFoundException('Supplier ID not found');
    supplierName = supplier.name;
  } else if (data.supplier && typeof data.supplier === 'string') {
    supplierName = data.supplier;
  }

  const totalValue = Number(data.receivedQuantity) * Number(data.unitCost);

  // ✅ Log the prepared data before saving
  const stockData = {
    sku: data.sku,
    itemName: data.itemName,
    categoryId: data.categoryId ?? null,
    supplier: supplierName,
    unitOfMeasure: data.unitOfMeasure,
    receivedQuantity: data.receivedQuantity,
    unitCost: new Prisma.Decimal(data.unitCost),
    totalValue: new Prisma.Decimal(totalValue),
    warehouseLocation: data.warehouseLocation,
    receivedDate: new Date(data.receivedDate),
    reorderLevel: data.reorderLevel,
    adminId,
  };

  console.log('Stock data before saving:', stockData);

  return this.prisma.stock.create({ data: stockData });
}

async findAll(adminId: string) {
  return this.prisma.stock.findMany({
    where: { adminId },  // Only stocks created by this admin
    orderBy: { createdAt: 'desc' },
  });
}


  async findOne(id: number) {
    const stock = await this.prisma.stock.findUnique({ where: { id } });
    if (!stock) throw new NotFoundException('Stock item not found');
    return stock;
  }

  async update(id: number, data: any) {
    const existing = await this.findOne(id);

    let supplierName = existing.supplier;
    if (data.supplier) {
      if (data.supplier.length === 36) {
        const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplier } });
        if (!supplier) throw new NotFoundException('Supplier ID not found');
        supplierName = supplier.name;
      } else {
        supplierName = data.supplier;
      }
    }

    const totalValue =
      (data.receivedQuantity ?? existing.receivedQuantity) *
      (data.unitCost ?? Number(existing.unitCost));

    return this.prisma.stock.update({
      where: { id },
      data: {
        ...data,
        supplier: supplierName,
        totalValue: new Prisma.Decimal(totalValue),
        unitCost: data.unitCost ? new Prisma.Decimal(data.unitCost) : existing.unitCost,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.stock.delete({ where: { id } });
  }
}
