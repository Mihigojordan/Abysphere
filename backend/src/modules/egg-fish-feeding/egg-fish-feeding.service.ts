import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EggFishFeedingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create feeding record
async create(data: any) {
  if (!data.parentEggMigrationId || typeof data.parentEggMigrationId !== 'string')
    throw new BadRequestException('parentEggMigrationId is required and must be a string.');

  if (!data.feedId || typeof data.feedId !== 'string')
    throw new BadRequestException('feedId is required and must be a string.');

  if (!data.employeeId || typeof data.employeeId !== 'string')
    throw new BadRequestException('employeeId is required and must be a string.');

  if (data.quantity !== undefined && (isNaN(data.quantity) || data.quantity <= 0))
    throw new BadRequestException('quantity must be a positive number.');

  // ✅ Check foreign key existence
  const [migration, feed, employee] = await Promise.all([
    this.prisma.parentEggMigration.findUnique({ where: { id: data.parentEggMigrationId } }),
    this.prisma.feedStock.findUnique({ where: { id: data.feedId } }),
    this.prisma.employee.findUnique({ where: { id: data.employeeId } }),
  ]);

  if (!migration) throw new BadRequestException('Invalid parentEggMigrationId.');
  if (!feed) throw new BadRequestException('Invalid feedId.');
  if (!employee) throw new BadRequestException('Invalid employeeId.');

  // ✅ Check feed stock
  if (feed.quantity < data.quantity) {
    throw new BadRequestException(
      `Insufficient feed stock. Available: ${feed.quantity}, requested: ${data.quantity}`,
    );
  }

  // ✅ Transaction: create feeding + update feed stock
  return this.prisma.$transaction(async (prisma) => {
    const feeding = await prisma.eggFishFeeding.create({
      data: {
        parentEggMigrationId: data.parentEggMigrationId,
        feedId: data.feedId,
        employeeId: data.employeeId,
        quantity: data.quantity,
      },
      include: {
        parentEggMigration: true,
        feed: true,
        employee: true,
      },
    });

    await prisma.feedStock.update({
      where: { id: data.feedId },
      data: {
        quantity: feed.quantity - data.quantity,
      },
    });

    return feeding;
  });
}


  // ✅ Find all
  async findAll() {
    return this.prisma.eggFishFeeding.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        parentEggMigration: true,
        feed: true,
        employee: true,
      },
    });
  }

  // ✅ Find one
  async findOne(id: string) {
    const record = await this.prisma.eggFishFeeding.findUnique({
      where: { id },
      include: {
        parentEggMigration: true,
        feed: true,
        employee: true,
      },
    });

    if (!record) throw new NotFoundException('EggFishFeeding record not found.');
    return record;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const existing = await this.prisma.eggFishFeeding.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('EggFishFeeding record not found.');

    if (data.quantity !== undefined && (isNaN(data.quantity) || data.quantity < 0))
      throw new BadRequestException('quantity must be a non-negative number.');

    if (data.feedId) {
      const feed = await this.prisma.feedStock.findUnique({ where: { id: data.feedId } });
      if (!feed) throw new BadRequestException('Invalid feedId.');
    }

    if (data.employeeId) {
      const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
      if (!employee) throw new BadRequestException('Invalid employeeId.');
    }

    return this.prisma.eggFishFeeding.update({
      where: { id },
      data: {
        parentEggMigrationId: data.parentEggMigrationId ?? existing.parentEggMigrationId,
        feedId: data.feedId ?? existing.feedId,
        employeeId: data.employeeId ?? existing.employeeId,
        quantity: data.quantity ?? existing.quantity,
      },
      include: {
        parentEggMigration: true,
        feed: true,
        employee: true,
      },
    });
  }

  // ✅ Delete
  async remove(id: string) {
    const record = await this.prisma.eggFishFeeding.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('EggFishFeeding record not found.');

    return this.prisma.eggFishFeeding.delete({ where: { id } });
  }
}
