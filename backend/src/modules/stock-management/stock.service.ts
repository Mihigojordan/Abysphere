import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) { }

  async createStock(data: any, adminId: string) {
    let supplierName: string | null = null;

    if (data.supplier && typeof data.supplier === 'string' && data.supplier.length === 36) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: data.supplier } });
      if (!supplier) throw new NotFoundException('Supplier ID not found');
      supplierName = supplier.name;
    } else if (data.supplier && typeof data.supplier === 'string') {
      supplierName = data.supplier;
    }

    // Check if product with same name already exists for this admin
    const existingStock = await this.prisma.stock.findFirst({
      where: {
        itemName: data.itemName,
        adminId: adminId,
      },
    });

    if (existingStock) {
      const oldQty = Number(existingStock.receivedQuantity) || 0;
      const addedQty = Number(data.receivedQuantity) || 0;
      const newQuantity = oldQty + addedQty;
      const unitCost = data.unitCost !== undefined ? Number(data.unitCost) : Number(existingStock.unitCost);
      const totalValue = newQuantity * unitCost;

      const updated = await this.prisma.stock.update({
        where: { id: existingStock.id },
        data: {
          receivedQuantity: newQuantity,
          unitCost: new Prisma.Decimal(unitCost),
          totalValue: new Prisma.Decimal(totalValue),
          supplier: supplierName || existingStock.supplier,
          warehouseLocation: data.warehouseLocation || existingStock.warehouseLocation,
          receivedDate: data.receivedDate ? new Date(data.receivedDate) : existingStock.receivedDate,
          reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : existingStock.reorderLevel,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : existingStock.expiryDate,
        },
      });

      // Record stock history — IN (merge with existing)
      await this.prisma.stockHistory.create({
        data: {
          stockId: existingStock.id,
          movementType: 'IN',
          sourceType: 'GRN',
          qtyBefore: new Prisma.Decimal(oldQty),
          qtyChange: new Prisma.Decimal(addedQty),
          qtyAfter: new Prisma.Decimal(newQuantity),
          unitPrice: new Prisma.Decimal(unitCost),
          notes: `Stock replenished: ${data.itemName} (+${addedQty})`,
          createdByAdminId: adminId,
        },
      });

      return updated;
    }

    const receivedQuantity = Number(data.receivedQuantity) || 0;
    const unitCost = Number(data.unitCost) || 0;
    const totalValue = receivedQuantity * unitCost;

    const stockData = {
      sku: data.sku,
      itemName: data.itemName,
      categoryId: data.categoryId ?? null,
      supplier: supplierName,
      unitOfMeasure: data.unitOfMeasure || 'PCS',
      receivedQuantity: receivedQuantity,
      unitCost: new Prisma.Decimal(unitCost),
      totalValue: new Prisma.Decimal(totalValue),
      warehouseLocation: data.warehouseLocation || 'N/A',
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
      reorderLevel: Number(data.reorderLevel) || 0,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      adminId,
    };

    const created = await this.prisma.stock.create({ data: stockData });

    // Record stock history — IN (new stock)
    await this.prisma.stockHistory.create({
      data: {
        stockId: created.id,
        movementType: 'IN',
        sourceType: 'GRN',
        qtyBefore: new Prisma.Decimal(0),
        qtyChange: new Prisma.Decimal(receivedQuantity),
        qtyAfter: new Prisma.Decimal(receivedQuantity),
        unitPrice: new Prisma.Decimal(unitCost),
        notes: `New stock created: ${data.itemName}`,
        createdByAdminId: adminId,
      },
    });

    return created;
  }

  async findAll(adminId: string) {
    return this.prisma.stock.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStockAlerts(adminId: string) {
    const lowStock = await this.prisma.stock.findMany({
      where: {
        adminId,
        receivedQuantity: { lte: this.prisma.stock.fields.reorderLevel },
      },
      orderBy: { receivedQuantity: 'asc' },
      take: 10,
    });

    const highStock = await this.prisma.stock.findMany({
      where: { adminId },
      orderBy: { receivedQuantity: 'desc' },
      take: 10,
    });

    return { lowStock, highStock };
  }

  async findOne(id: number) {
    const stock = await this.prisma.stock.findUnique({ where: { id } });

    if (!stock) throw new NotFoundException('Stock item not found');
    return stock;
  }

  async update(id: number, data: any, adminId?: string) {
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

    const oldQty = Number(existing.receivedQuantity);
    const newQuantity = data.receivedQuantity !== undefined ? Number(data.receivedQuantity) : oldQty;
    const newUnitCost = data.unitCost !== undefined ? Number(data.unitCost) : Number(existing.unitCost);
    const totalValue = newQuantity * newUnitCost;
    // remove FK from spread so Prisma doesn't see it
    const { categoryId, ...rest } = data;


    const updateData = {
      ...rest,

      receivedQuantity: newQuantity,
      unitCost: new Prisma.Decimal(newUnitCost),
      totalValue: new Prisma.Decimal(totalValue),
      supplier: supplierName,
      receivedDate: data.receivedDate
        ? new Date(data.receivedDate)
        : existing.receivedDate,
      reorderLevel:
        data.reorderLevel !== undefined
          ? Number(data.reorderLevel)
          : existing.reorderLevel,
      expiryDate: data.expiryDate
        ? new Date(data.expiryDate)
        : existing.expiryDate,
    };

    // ✅ only update relation if provided
    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId }
      };
    }

    const updated = await this.prisma.stock.update({
      where: { id },
      data: updateData,
    });


    // Record stock history — ADJUSTMENT (update)
    if (oldQty !== newQuantity) {
      await this.prisma.stockHistory.create({
        data: {
          stockId: id,
          movementType: 'ADJUSTMENT',
          sourceType: 'ADJUSTMENT',
          qtyBefore: new Prisma.Decimal(oldQty),
          qtyChange: new Prisma.Decimal(Math.abs(newQuantity - oldQty)),
          qtyAfter: new Prisma.Decimal(newQuantity),
          unitPrice: new Prisma.Decimal(newUnitCost),
          notes: `Stock adjusted: ${existing.itemName} (${oldQty} → ${newQuantity})`,
          createdByAdminId: adminId || existing.adminId,
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.stock.delete({ where: { id } });
  }

  // ── Stock History Queries ──────────────────────────────────────────

  async getStockHistory(adminId: string) {
    return this.prisma.stockHistory.findMany({
      where: { stockId: { not: null }, createdByAdminId: adminId },
      include: {
        stock: true,
        createdByAdmin: true,
        createdByEmployee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStockHistoryByStockId(stockId: number, adminId: string) {
    return this.prisma.stockHistory.findMany({
      where: { stockId, createdByAdminId: adminId },
      include: {
        stock: true,
        createdByAdmin: true,
        createdByEmployee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async bulkImport(data: any[], adminId: string) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const [index, item] of data.entries()) {
      try {
        // Validate required fields
        if (!item.itemName) throw new Error('Item Name is required');

        // Resolve Category
        let categoryId = item.categoryId;
        if (!categoryId && item.category) {
          const category = await this.prisma.category.findFirst({
            where: { name: item.category },
          });
          if (category) categoryId = category.id;
        }

        // Resolve Supplier (if name provided)
        let supplierName = item.supplier;
        // If supplier is not provided or is just a name string, it's handled in createStock logic slightly differently
        // But here we can just pass it through. logic in createStock handles ID or Name check.
        // However, if we want to be strict about mapping existing suppliers:
        if (item.supplier && typeof item.supplier === 'string') {
          // Check if it's an ID or Name. If it's a valid UUID, createStock handles it. 
          // If it's a name, createStock handles it as a string name. 
          // So we might not need extra logic here unless we want to enforce existing supplier.
        }

        // Prepare data for createStock
        const stockData = {
          sku: item.sku || `SKU-${Date.now()}-${index}`, // Generate SKU if missing
          itemName: item.itemName,
          categoryId: categoryId,
          supplier: item.supplier,
          receivedQuantity: item.quantity || item.receivedQuantity || 0,
          unitCost: item.unitCost || 0,
          unitOfMeasure: item.unitOfMeasure || 'PCS',
          warehouseLocation: item.warehouseLocation || item.location,
          minStockLevel: item.minStockLevel || item.reorderLevel,
          reorderLevel: item.reorderLevel || 0,
          expiryDate: item.expiryDate,
          receivedDate: item.receivedDate,
          description: item.description,
        };

        await this.createStock(stockData, adminId);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${index + 1} (${item.itemName || 'Unknown'}): ${error.message}`);
      }
    }

    return results;
  }
}
