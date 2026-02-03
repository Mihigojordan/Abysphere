import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GrownEggPondFeedingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create feeding
  async create(data: any) {
    const { eggToPondMigrationId, feedId, employeeId, quantity } = data;

    if (!eggToPondMigrationId || typeof eggToPondMigrationId !== 'string') {
      throw new BadRequestException('eggToPondMigrationId is required.');
    }
    if (!feedId || typeof feedId !== 'string') {
      throw new BadRequestException('feedId is required.');
    }
    if (!employeeId || typeof employeeId !== 'string') {
      throw new BadRequestException('employeeId is required.');
    }
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      throw new BadRequestException('quantity is required and must be greater than 0.');
    }

    // Validate foreign keys
    const [migration, feed, employee] = await Promise.all([
      this.prisma.eggToPondMigration.findUnique({ where: { id: eggToPondMigrationId } }),
      this.prisma.feedStock.findUnique({ where: { id: feedId } }),
      this.prisma.employee.findUnique({ where: { id: employeeId } }),
    ]);

    if (!migration) throw new BadRequestException('Invalid eggToPondMigrationId.');
    if (!feed) throw new BadRequestException('Invalid feedId.');
    if (!employee) throw new BadRequestException('Invalid employeeId.');

    if (feed.quantity < quantity) {
      throw new BadRequestException(`Insufficient feed stock. Available: ${feed.quantity}`);
    }

    // Decrement feed stock
    await this.prisma.feedStock.update({
      where: { id: feedId },
      data: { quantity: feed.quantity - quantity },
    });

    // Create feeding record
    return this.prisma.grownEggPondFeeding.create({
      data: {
        eggToPondMigrationId,
        feedId,
        employeeId,
        quantity,
      },
      include: { eggToPondMigration: true, feed: true, employee: true },
    });
  }

  // ✅ Get all
  async findAll() {
    return this.prisma.grownEggPondFeeding.findMany({
      orderBy: { createdAt: 'desc' },
      include: { eggToPondMigration: true, feed: true, employee: true },
    });
  }

  // ✅ Get one
  async findOne(id: string) {
    const record = await this.prisma.grownEggPondFeeding.findUnique({
      where: { id },
      include: { eggToPondMigration: true, feed: true, employee: true },
    });
    if (!record) throw new NotFoundException('GrownEggPondFeeding not found.');
    return record;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const record = await this.prisma.grownEggPondFeeding.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('GrownEggPondFeeding not found.');

    const updatedData: any = {};

    if (data.quantity && typeof data.quantity === 'number' && data.quantity > 0) {
      const feed = await this.prisma.feedStock.findUnique({ where: { id: record.feedId } });
      if (!feed) throw new BadRequestException('Feed not found.');

      // Adjust stock: return old quantity, then subtract new quantity
      const newStock = feed.quantity + record.quantity - data.quantity;
      if (newStock < 0) throw new BadRequestException('Insufficient feed stock for update.');
      await this.prisma.feedStock.update({
        where: { id: feed.id },
        data: { quantity: newStock },
      });

      updatedData.quantity = data.quantity;
    }

    if (data.feedId && data.feedId !== record.feedId) {
      const newFeed = await this.prisma.feedStock.findUnique({ where: { id: data.feedId } });
      if (!newFeed) throw new BadRequestException('New feed not found.');
      updatedData.feedId = data.feedId;
    }

    if (data.employeeId && data.employeeId !== record.employeeId) {
      const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
      if (!employee) throw new BadRequestException('Employee not found.');
      updatedData.employeeId = data.employeeId;
    }

    return this.prisma.grownEggPondFeeding.update({
      where: { id },
      data: updatedData,
      include: { eggToPondMigration: true, feed: true, employee: true },
    });
  }

  // ✅ Delete
  async remove(id: string) {
    const record = await this.prisma.grownEggPondFeeding.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('GrownEggPondFeeding not found.');
    // Optionally return stock on delete
    await this.prisma.feedStock.update({
      where: { id: record.feedId },
      data: { quantity: { increment: record.quantity } },
    });

    return this.prisma.grownEggPondFeeding.delete({ where: { id } });
  }
}
