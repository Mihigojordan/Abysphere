import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ParentFishFeedingService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a feeding record
  async create(data: any) {
    return this.prisma.parentFishFeeding.create({
      data,
    });
  }

  // Get all feeding records
  async findAll() {
    return this.prisma.parentFishFeeding.findMany({
      include: {
        parentFishPool: true,
        feed: true,
        employee: true,
      },
    });
  }

  // Get a single feeding record by ID
  async findOne(id: string) {
    return this.prisma.parentFishFeeding.findUnique({
      where: { id },
      include: {
        parentFishPool: true,
        feed: true,
        employee: true,
      },
    });
  }

  // Update a feeding record
  async update(id: string, data: any) {
    return this.prisma.parentFishFeeding.update({
        
      where: { id },
      data,
    });
  }

  // Delete a feeding record
  async remove(id: string) {
    return this.prisma.parentFishFeeding.delete({
      where: { id },
    });
  }
}
