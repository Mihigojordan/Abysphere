import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedstockService {
  constructor(private prisma: PrismaService) {}

  // Use Prisma.FeedStockCreateInput to match Prisma's expected create input
  async create(data) {
    return this.prisma.feedStock.create({ data });
  }

  async findAll() {
    return this.prisma.feedStock.findMany();
  }

  async findOne(id: string) {
    const feedStock = await this.prisma.feedStock.findUnique({ where: { id } });
    if (!feedStock) throw new NotFoundException('FeedStock not found');
    return feedStock;
  }

  // Update uses Prisma.FeedStockUpdateInput
  async update(id: string, data) {
    const existing = await this.findOne(id);
    return this.prisma.feedStock.update({
      where: { id: existing.id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.feedStock.delete({ where: { id } });
  }
}
