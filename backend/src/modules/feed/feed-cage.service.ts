import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedCageService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create new feed record
  async create(data: any) {
    if (!data.cageId) throw new BadRequestException('cageId is required.');
    if (!data.feedId) throw new BadRequestException('feedId is required.');
    if (!data.employeeId ) throw new BadRequestException('Employee Id is required.');
    if (data.quantityGiven === undefined || data.quantityGiven <= 0)
      throw new BadRequestException('quantityGiven must be a positive number.');

    const [cage, feed, employee] = await Promise.all([
      this.prisma.cage.findUnique({ where: { id: data.cageId } }),
      this.prisma.feedStock.findUnique({ where: { id: data.feedId } }),
        this.prisma.employee.findUnique({ where: { id: data.employeeId } }) ,
    ]);

    if (!cage) throw new BadRequestException('Invalid cageId.');
    if (!feed) throw new BadRequestException('Invalid feedId.');
    if (data.employeeId && !employee) throw new BadRequestException('Invalid employeeId.');

    if (feed.quantity < data.quantityGiven) throw new BadRequestException(`Insufficient feed stock. Available: ${feed.quantity}`);

    const result = await this.prisma.$transaction(async (tx) => {
      const feeding = await tx.feedCage.create({
        data: {
          cageId: data.cageId,
          feedId: data.feedId,
          employeeId: data.employeeId || null,
          quantityGiven: data.quantityGiven,
          notes: data.notes?.trim() || null,
        },
        include: { cage: true, feed: true, employee: true },
      });

      await tx.feedStock.update({
        where: { id: data.feedId },
        data: { quantity: { decrement: data.quantityGiven } },
      });

      return feeding;
    });

    return result;
  }

  // ✅ Get all feeds
  async findAll() {
    return this.prisma.feedCage.findMany({
      orderBy: { createdAt: 'desc' },
      include: { cage: true, feed: true, employee: true },
    });
  }

  // ✅ Get all feeds for specific cage
  async findAllByCageId(cageId: string) {
    const cage = await this.prisma.cage.findUnique({ where: { id: cageId } });
    if (!cage) throw new NotFoundException('Cage not found.');
    return this.prisma.feedCage.findMany({
      where: { cageId },
      orderBy: { createdAt: 'desc' },
      include: { cage: true, feed: true, employee: true },
    });
  }

  // ✅ Get one feed record
  async findOne(id: string) {
    const feed = await this.prisma.feedCage.findUnique({
      where: { id },
      include: { cage: true, feed: true, employee: true },
    });
    if (!feed) throw new NotFoundException('Feed record not found.');
    return feed;
  }

  // ✅ Update record
  async update(id: string, data: any) {
    const record = await this.prisma.feedCage.findUnique({
      where: { id },
      include: { feed: true },
    });
    if (!record) throw new NotFoundException('Feed record not found.');

    if (data.quantityGiven && typeof data.quantityGiven !== 'number')
      throw new BadRequestException('quantityGiven must be a number.');

    const quantityDiff = data.quantityGiven
      ? data.quantityGiven - record.quantityGiven
      : 0;

    if (quantityDiff > 0 && record.feed.quantity < quantityDiff)
      throw new BadRequestException(
        `Insufficient feed stock to increase feed quantity. Available: ${record.feed.quantity}`
      );

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.feedCage.update({
        where: { id },
        data: {
          quantityGiven: data.quantityGiven ?? record.quantityGiven,
          notes: data.notes?.trim() ?? record.notes,
        },
        include: { cage: true, feed: true, employee: true },
      });

      if (quantityDiff !== 0) {
        await tx.feedStock.update({
          where: { id: record.feedId },
          data: { quantity: { decrement: quantityDiff } },
        });
      }

      return updated;
    });

    return result;
  }

  // ✅ Delete record
  async remove(id: string) {
    const record = await this.prisma.feedCage.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Feed record not found.');
    return this.prisma.feedCage.delete({ where: { id } });
  }
}
