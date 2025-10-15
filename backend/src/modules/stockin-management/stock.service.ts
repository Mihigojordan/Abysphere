import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Unit,StockHistory } from 'generated/prisma';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  // --------------------------
  // CATEGORY CRUD
  // --------------------------

  async createCategory(data: { name: string; description?: string }) {
    if (!data.name || data.name.trim() === '') {
      throw new BadRequestException('Category name is required');
    }

    return this.prisma.stockCategory.create({ data });
  }

  async getAllCategories() {
    return this.prisma.stockCategory.findMany({ include: { stockins: true } });
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.stockCategory.findUnique({
      where: { id },
      include: { stockins: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    if (data.name !== undefined && data.name.trim() === '') {
      throw new BadRequestException('Category name cannot be empty');
    }

    try {
      return this.prisma.stockCategory.update({ where: { id }, data });
    } catch (e) {
      throw new NotFoundException('Category not found');
    }
  }

  async deleteCategory(id: string) {
    try {
      return this.prisma.stockCategory.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('Category not found or already deleted');
    }
  }

  // --------------------------
  // STOCKIN CRUD
  // --------------------------

async createStockIn(data: {
  productName: string;
  sku?: string;
  quantity?: number;
  unit: Unit;
  unitPrice: number;
  reorderLevel?: number;
  supplier?: string;
  location?: string;
  description?: string;
  stockcategoryId: string;
  storeId: string;
}) {
  // ----------------------
  // Validation
  // ----------------------
  if (!data.productName || data.productName.trim() === '') {
    throw new BadRequestException('Product name is required');
  }
  if (!data.unit) throw new BadRequestException('Unit is required');
  if (data.quantity !== undefined && data.quantity < 0)
    throw new BadRequestException('Quantity cannot be negative');
  if (data.unitPrice < 0) throw new BadRequestException('Unit price cannot be negative');

  // ----------------------
  // Check category exists
  // ----------------------
  const category = await this.prisma.stockCategory.findUnique({
    where: { id: data.stockcategoryId },
  });
  if (!category) throw new BadRequestException('Category does not exist');

  // ----------------------
  // Check store exists
  // ----------------------
  const store = await this.prisma.store.findUnique({ where: { id: data.storeId } });
  if (!store) throw new BadRequestException('Store does not exist');

  // ----------------------
  // Generate SKU if not provided
  // ----------------------
  if (!data.sku || data.sku.trim() === '') {
    const words = data.productName.trim()
      .split(' ')
      .map((w) => w[0].trim().toUpperCase())
      .join(''); // take first letters of each word, uppercase

    const uuidSegment = uuidv4().replace(/-/g, '').slice(0, 4); // take 4 chars from UUID
    data.sku = `${words}${uuidSegment}`;
  }

  // ----------------------
  // Create stock
  // ----------------------
  return this.prisma.stockIn.create({ data });
}


  async getAllStockIns() {
    return this.prisma.stockIn.findMany({ include: { stockcategory: true, store: true } });
  }

  async getStockInById(id: string) {
    const stock = await this.prisma.stockIn.findUnique({
      where: { id },
      include: { stockcategory: true, store: true },
    });
    if (!stock) throw new NotFoundException('Stock item not found');
    return stock;
  }

  async updateStockIn(
    id: string,
    data: {
      productName?: string;
      sku?: string;
      quantity?: number;
      unit?: Unit;
      unitPrice?: number;
      reorderLevel?: number;
      supplier?: string;
      location?: string;
      description?: string;
      stockcategoryId?: string;
      storeId?: string;
    },
  ) {
    if (data.productName !== undefined && data.productName.trim() === '') {
      throw new BadRequestException('Product name cannot be empty');
    }
    if (data.quantity !== undefined && data.quantity < 0)
      throw new BadRequestException('Quantity cannot be negative');
    if (data.unitPrice !== undefined && data.unitPrice < 0)
      throw new BadRequestException('Unit price cannot be negative');

    if (data.stockcategoryId) {
      const category = await this.prisma.stockCategory.findUnique({
        where: { id: data.stockcategoryId },
      });
      if (!category) throw new BadRequestException('Category does not exist');
    }

    if (data.storeId) {
      const store = await this.prisma.store.findUnique({ where: { id: data.storeId } });
      if (!store) throw new BadRequestException('Store does not exist');
    }

    try {
      return await this.prisma.stockIn.update({ where: { id }, data });
    } catch (e) {
      throw new NotFoundException('Stock item not found');
    }
  }

  async deleteStockIn(id: string) {
    try {
      return await this.prisma.stockIn.delete({ where: { id } });
    } catch (e) {
      throw new NotFoundException('Stock item not found or already deleted');
    }
  }

    async getAllStockHistory(): Promise<StockHistory[]> {
    return this.prisma.stockHistory.findMany({
      include: {
        stockIn: true,
        createdByAdmin: true,
        createdByEmployee: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch by stockInId
  async getStockHistoryByStock(stockInId: string): Promise<StockHistory[]> {
    return this.prisma.stockHistory.findMany({
      where: { stockInId },
      include: {
        stockIn: true,
        createdByAdmin: true,
        createdByEmployee: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch by source/request
  async getStockHistoryByRequest(requestId: string): Promise<StockHistory[]> {
    return this.prisma.stockHistory.findMany({
      where: { sourceId: requestId },
      include: {
        stockIn: true,
        createdByAdmin: true,
        createdByEmployee: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

   async getStockHistoryByMovement(movementType: 'IN' | 'OUT' | 'ADJUSTMENT'): Promise<StockHistory[]> {
    return this.prisma.stockHistory.findMany({
      where: { movementType },
      include: {
        stockIn: true,
        createdByAdmin: true,
        createdByEmployee: true,
        request: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
