import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DebitStatus } from 'generated/prisma';

interface Payment {
  amount: number;
  paidAt: string;
  note?: string;
}

@Injectable()
export class DebitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new debit record
   */
  async create(data: {
    description?: string;
    totalAmount: number;
    stockOutId?: string;
    adminId?: string;
    employeeId?: string;
  }) {
    const { totalAmount, stockOutId, adminId, employeeId, description } = data;

    if (!totalAmount || totalAmount <= 0) {
      throw new BadRequestException('Total amount must be greater than 0');
    }

    // Verify stockOut exists if provided
    if (stockOutId) {
      const stockOut = await this.prisma.stockOut.findUnique({
        where: { id: stockOutId },
      });
      if (!stockOut) {
        throw new NotFoundException(`StockOut with ID ${stockOutId} not found`);
      }
    }

    return this.prisma.debit.create({
      data: {
        description,
        totalAmount,
        stockOutId,
        adminId,
        employeeId,
        status: DebitStatus.PENDING,
        payments: [],
      },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });
  }

  /**
   * Get all debits for an admin
   */
  async getAll(adminId: string) {
    if (!adminId) {
      throw new BadRequestException('Admin ID is required');
    }

    return this.prisma.debit.findMany({
      where: { adminId },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single debit by ID
   */
  async getOne(id: string) {
    const debit = await this.prisma.debit.findUnique({
      where: { id },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });

    if (!debit) {
      throw new NotFoundException('Debit not found');
    }

    return debit;
  }

  /**
   * Get debit by stockOut ID
   */
  async getByStockOutId(stockOutId: string) {
    return this.prisma.debit.findFirst({
      where: { stockOutId },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });
  }

  /**
   * Record a payment against a debit
   */
  async recordPayment(
    id: string,
    data: {
      amount: number;
      note?: string;
    },
  ) {
    const { amount, note } = data;

    if (!amount || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const debit = await this.prisma.debit.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new NotFoundException('Debit not found');
    }

    if (debit.status === DebitStatus.PAID) {
      throw new BadRequestException('This debit is already fully paid');
    }

    if (debit.status === DebitStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for cancelled debit');
    }

    // Calculate total paid so far
    const existingPayments: Payment[] = (debit?.payments as any[]) || [];
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const remainingAmount = debit.totalAmount - totalPaid;

    if (amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount (${amount}) exceeds remaining balance (${remainingAmount})`,
      );
    }

    // Add new payment
    const newPayment: Payment = {
      amount,
      paidAt: new Date().toISOString(),
      note,
    };

    const updatedPayments = [...existingPayments, newPayment] as any;
    const newTotalPaid = totalPaid + amount;

    // Determine new status
    let newStatus: DebitStatus;
    if (newTotalPaid >= debit.totalAmount) {
      newStatus = DebitStatus.PAID;
    } else if (newTotalPaid > 0) {
      newStatus = DebitStatus.PARTIALLY_PAID;
    } else {
      newStatus = DebitStatus.PENDING;
    }

    return this.prisma.debit.update({
      where: { id },
      data: {
        payments: updatedPayments,
        status: newStatus,
      },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });
  }

  /**
   * Update debit details (description, totalAmount)
   */
  async update(
    id: string,
    data: {
      description?: string;
      totalAmount?: number;
    },
  ) {
    const debit = await this.prisma.debit.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new NotFoundException('Debit not found');
    }

    // If totalAmount is being updated, recalculate status
    let newStatus = debit.status;
    if (data.totalAmount !== undefined) {
      const existingPayments: Payment[] = (debit?.payments as any[]) || [];
      const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);

      if (totalPaid >= data.totalAmount) {
        newStatus = DebitStatus.PAID;
      } else if (totalPaid > 0) {
        newStatus = DebitStatus.PARTIALLY_PAID;
      } else {
        newStatus = DebitStatus.PENDING;
      }
    }

    return this.prisma.debit.update({
      where: { id },
      data: {
        description: data.description ?? debit.description,
        totalAmount: data.totalAmount ?? debit.totalAmount,
        status: newStatus,
      },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });
  }

  /**
   * Cancel a debit
   */
  async cancel(id: string) {
    const debit = await this.prisma.debit.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new NotFoundException('Debit not found');
    }

    if (debit.status === DebitStatus.PAID) {
      throw new BadRequestException('Cannot cancel a fully paid debit');
    }

    return this.prisma.debit.update({
      where: { id },
      data: {
        status: DebitStatus.CANCELLED,
      },
      include: {
        stockOut: {
          include: {
            stockin: true,
          },
        },
        admin: true,
        employee: true,
      },
    });
  }

  /**
   * Delete a debit
   */
  async delete(id: string) {
    const debit = await this.prisma.debit.findUnique({
      where: { id },
    });

    if (!debit) {
      throw new NotFoundException('Debit not found');
    }

    // Check if there are any payments
    const existingPayments: Payment[] = (debit?.payments as any[]) || [];
    if (existingPayments.length > 0) {
      throw new BadRequestException(
        'Cannot delete debit with existing payments. Cancel it instead.',
      );
    }

    return this.prisma.debit.delete({
      where: { id },
    });
  }

  /**
   * Get debit statistics for dashboard
   */
  async getStats(adminId: string) {
    const debits = await this.prisma.debit.findMany({
      where: { adminId },
    });

    const totalDebits = debits.length;
    const totalDebitAmount = debits.reduce((sum, d) => sum + d.totalAmount, 0);

    let totalPaid = 0;
    debits.forEach((debit) => {
      const payments: Payment[] = (debit?.payments as any[]) || [];
      totalPaid += payments.reduce((sum, p) => sum + p.amount, 0);
    });

    const totalOutstanding = totalDebitAmount - totalPaid;

    const pendingCount = debits.filter(
      (d) => d.status === DebitStatus.PENDING,
    ).length;
    const partiallyPaidCount = debits.filter(
      (d) => d.status === DebitStatus.PARTIALLY_PAID,
    ).length;
    const paidCount = debits.filter((d) => d.status === DebitStatus.PAID).length;
    const cancelledCount = debits.filter(
      (d) => d.status === DebitStatus.CANCELLED,
    ).length;

    return {
      totalDebits,
      totalDebitAmount,
      totalPaid,
      totalOutstanding,
      pendingCount,
      partiallyPaidCount,
      paidCount,
      cancelledCount,
    };
  }
}
