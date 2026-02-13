import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Supplier, SupplierStatus, Prisma } from '../../../generated/prisma';

// DTOs
export interface CreateSupplierDto {
  code?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  creditLimit?: number;
  taxId?: string;
  rating?: number;
  status?: SupplierStatus;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> { }

export interface SupplierFilterDto {
  search?: string;
  status?: SupplierStatus;
  minRating?: number;
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Generate unique supplier code
   */
  private async generateSupplierCode(): Promise<string> {
    const lastSupplier = await this.prisma.supplier.findFirst({
      orderBy: { createdAt: 'desc' },
      where: { code: { startsWith: 'SUP-' } },
    });

    if (!lastSupplier || !lastSupplier.code) {
      return 'SUP-0001';
    }

    const lastNumber = parseInt(lastSupplier.code.split('-')[1] || '0', 10);
    const nextNumber = lastNumber + 1;
    return `SUP-${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Create a new supplier
   */
  async create(data: CreateSupplierDto): Promise<Supplier> {
    // Check for duplicate email
    if (data.email) {
      const existingEmail = await this.prisma.supplier.findUnique({
        where: { email: data.email },
      });
      if (existingEmail) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    // Generate code if not provided
    const code = data.code || (await this.generateSupplierCode());

    // Check for duplicate code
    const existingCode = await this.prisma.supplier.findUnique({
      where: { code },
    });
    if (existingCode) {
      throw new ConflictException('Supplier code already exists');
    }

    return this.prisma.supplier.create({
      data: {
        ...data,
        code,
        country: data.country || 'Rwanda',
        status: data.status || SupplierStatus.ACTIVE,
        rating: data.rating || 0,
        onTimeDeliveryPct: 0,
        qualityScore: 0,
      },
      include: {
        purchaseOrders: {
          select: { id: true, poNumber: true, status: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        grns: {
          select: { id: true, grnNumber: true, status: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get all suppliers with filtering and pagination
   */
  async findAll(filters: SupplierFilterDto = {}) {
    const {
      search,
      status,
      minRating,
      city,
      country,
      page: pageQuery = 1,
      limit: limitQuery = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const page = Number(pageQuery) || 1;
    const limit = Number(limitQuery) || 20;

    const where: Prisma.SupplierWhereInput = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Rating filter
    if (minRating !== undefined) {
      where.rating = { gte: Number(minRating) };
    }

    // Location filters
    if (city) {
      where.city = { contains: city };
    }
    if (country) {
      where.country = { contains: country };
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: {
              purchaseOrders: true,
              grns: true,
            },
          },
        },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get supplier by ID
   */
  async findOne(id: string): Promise<Prisma.SupplierGetPayload<{
    include: {
      purchaseOrders: {
        select: {
          id: true;
          poNumber: true;
          status: true;
          orderDate: true;
          grandTotal: true;
        };
      };
      grns: {
        select: {
          id: true;
          grnNumber: true;
          status: true;
          receivedDate: true;
        };
      };
      _count: {
        select: {
          purchaseOrders: true;
          grns: true;
          documents: true;
        };
      };
    };
  }>> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          select: {
            id: true,
            poNumber: true,
            status: true,
            orderDate: true,
            grandTotal: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        grns: {
          select: {
            id: true,
            grnNumber: true,
            status: true,
            receivedDate: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            purchaseOrders: true,
            grns: true,
            documents: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Update supplier
   */
  async update(id: string, data: UpdateSupplierDto): Promise<Supplier> {
    // Check if supplier exists
    await this.findOne(id);

    // Check for email conflict if updating email
    if (data.email) {
      const existingEmail = await this.prisma.supplier.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (existingEmail) {
        throw new ConflictException('Supplier with this email already exists');
      }
    }

    return this.prisma.supplier.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            purchaseOrders: true,
            grns: true,
          },
        },
      },
    });
  }

  /**
   * Delete supplier
   */
  async remove(id: string): Promise<void> {
    // Check if supplier exists
    await this.findOne(id);

    // Check if supplier has related purchase orders
    const poCount = await this.prisma.purchaseOrder.count({
      where: { supplierId: id },
    });

    if (poCount > 0) {
      throw new BadRequestException(
        `Cannot delete supplier. ${poCount} purchase order(s) are linked to this supplier.`
      );
    }

    await this.prisma.supplier.delete({ where: { id } });
  }

  /**
   * Get supplier performance metrics
   */
  async getPerformance(id: string) {
    const supplier = await this.findOne(id);

    // Get all completed GRNs
    const grns = await this.prisma.goodsReceivingNote.findMany({
      where: {
        supplierId: id,
        status: 'APPROVED',
      },
      include: {
        purchaseOrder: {
          select: {
            expectedDeliveryDate: true,
          },
        },
      },
    });

    // Calculate on-time delivery percentage
    const onTimeDeliveries = grns.filter((grn) => {
      if (!grn.purchaseOrder.expectedDeliveryDate) return true;
      return new Date(grn.receivedDate) <= new Date(grn.purchaseOrder.expectedDeliveryDate);
    }).length;

    const onTimeDeliveryPct = grns.length > 0 ? (onTimeDeliveries / grns.length) * 100 : 0;

    // Get quality score (based on accepted vs rejected items)
    const grnItems = await this.prisma.gRNItem.findMany({
      where: {
        grn: {
          supplierId: id,
        },
      },
    });

    const totalItems = grnItems.reduce((sum, item) => sum + Number(item.receivedQty), 0);
    const acceptedItems = grnItems.reduce((sum, item) => sum + Number(item.acceptedQty), 0);
    const qualityScore = totalItems > 0 ? (acceptedItems / totalItems) * 100 : 0;

    // Update supplier metrics
    await this.prisma.supplier.update({
      where: { id },
      data: {
        onTimeDeliveryPct: Math.round(onTimeDeliveryPct * 100) / 100,
        qualityScore: Math.round(qualityScore * 100) / 100,
      },
    });

    return {
      supplierId: id,
      supplierName: supplier.name,
      totalPurchaseOrders: supplier._count?.purchaseOrders || 0,
      totalGRNs: supplier._count?.grns || 0,
      onTimeDeliveryPct: Math.round(onTimeDeliveryPct * 100) / 100,
      qualityScore: Math.round(qualityScore * 100) / 100,
      rating: supplier.rating || 0,
      totalDeliveries: grns.length,
      onTimeDeliveries,
      lateDeliveries: grns.length - onTimeDeliveries,
    };
  }

  /**
   * Get price history for a supplier (specific product)
   */
  async getPriceHistory(supplierId: string, productName?: string) {
    const where: any = {
      purchaseOrder: {
        supplierId,
      },
    };

    if (productName) {
      where.productName = { contains: productName };
    }

    const items = await this.prisma.purchaseOrderItem.findMany({
      where,
      select: {
        productName: true,
        productSku: true,
        unitPrice: true,
        orderedQty: true,
        unit: true,
        purchaseOrder: {
          select: {
            poNumber: true,
            orderDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        purchaseOrder: {
          orderDate: 'desc',
        },
      },
      take: 50,
    });

    return items.map((item) => ({
      productName: item.productName,
      productSku: item.productSku,
      unitPrice: Number(item.unitPrice),
      quantity: Number(item.orderedQty),
      unit: item.unit,
      poNumber: item.purchaseOrder.poNumber,
      orderDate: item.purchaseOrder.orderDate,
      status: item.purchaseOrder.status,
    }));
  }

  /**
   * Bulk import suppliers
   */
  async bulkImport(suppliers: CreateSupplierDto[]): Promise<{ created: number; errors: any[] }> {
    const errors: any[] = [];
    let created = 0;

    for (let i = 0; i < suppliers.length; i++) {
      try {
        await this.create(suppliers[i]);
        created++;
      } catch (error) {
        errors.push({
          row: i + 1,
          data: suppliers[i],
          error: error.message,
        });
      }
    }

    return { created, errors };
  }

  /**
   * Export suppliers
   */
  async export(filters: SupplierFilterDto = {}) {
    const { data } = await this.findAll({ ...filters, limit: 10000 });
    return data;
  }
}
