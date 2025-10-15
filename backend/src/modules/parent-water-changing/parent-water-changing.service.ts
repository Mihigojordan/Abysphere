import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParentWaterChangingService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create a new water change
  async create(data: any) {
    // Validate parentPoolId
    if (!data.parentPoolId || typeof data.parentPoolId !== 'string') {
      throw new BadRequestException('parentPoolId is required and must be a string.');
    }

    const pool = await this.prisma.parentFishPool.findUnique({
      where: { id: data.parentPoolId },
    });
    if (!pool) {
      throw new BadRequestException('Invalid parentPoolId: ParentFishPool not found.');
    }

    // Validate employeeId
    if (!data.employeeId || typeof data.employeeId !== 'string') {
      throw new BadRequestException('employeeId is required and must be a string.');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new BadRequestException('Invalid employeeId: Employee not found.');
    }

    // Validate litersChanged
    if (
      data.litersChanged === undefined ||
      typeof data.litersChanged !== 'number' ||
      data.litersChanged <= 0
    ) {
      throw new BadRequestException('litersChanged is required and must be a positive number.');
    }

    return this.prisma.parentWaterChanging.create({
      data: {
        parentPoolId: data.parentPoolId,
        employeeId: data.employeeId,
        litersChanged: data.litersChanged,
        description: data.description?.trim() || null,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { parentPool: true, employee: true },
    });
  }

  // ✅ Find all water changes
  async findAll() {
    return this.prisma.parentWaterChanging.findMany({
      orderBy: { date: 'desc' },
      include: { parentPool: true, employee: true },
    });
  }

  // ✅ Find one water change
  async findOne(id: string) {
    const record = await this.prisma.parentWaterChanging.findUnique({
      where: { id },
      include: { parentPool: true, employee: true },
    });
    if (!record) throw new NotFoundException('ParentWaterChanging record not found.');
    return record;
  }

  // ✅ Update water change
  async update(id: string, data: any) {
    const record = await this.prisma.parentWaterChanging.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('ParentWaterChanging record not found.');

    if (data.litersChanged !== undefined) {
      if (typeof data.litersChanged !== 'number' || data.litersChanged <= 0) {
        throw new BadRequestException('litersChanged must be a positive number.');
      }
    }

    if (data.parentPoolId) {
      const pool = await this.prisma.parentFishPool.findUnique({
        where: { id: data.parentPoolId },
      });
      if (!pool) {
        throw new BadRequestException('Invalid parentPoolId: ParentFishPool not found.');
      }
    }

    if (data.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: data.employeeId },
      });
      if (!employee) {
        throw new BadRequestException('Invalid employeeId: Employee not found.');
      }
    }

    return this.prisma.parentWaterChanging.update({
      where: { id },
      data: {
        parentPoolId: data.parentPoolId ?? record.parentPoolId,
        employeeId: data.employeeId ?? record.employeeId,
        litersChanged: data.litersChanged ?? record.litersChanged,
        description: data.description?.trim() ?? record.description,
        date: data.date ? new Date(data.date) : record.date,
      },
      include: { parentPool: true, employee: true },
    });
  }

  // ✅ Delete water change
  async remove(id: string) {
    const record = await this.prisma.parentWaterChanging.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('ParentWaterChanging record not found.');

    return this.prisma.parentWaterChanging.delete({ where: { id } });
  }
}
