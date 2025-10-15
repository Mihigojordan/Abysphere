import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParentFishPoolService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create
  async     create(data: any) {
    // Basic validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new BadRequestException('Name is required and must be a non-empty string.');
    }

    if (data.description && typeof data.description !== 'string') {
      throw new BadRequestException('Description must be a string.');
    }

    if (!data.employeeId || typeof data.employeeId !== 'string') {
      throw new BadRequestException('employeeId is required and must be a string.');
    }

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: data.employeeId },
    });
    if (!employee) {
      throw new BadRequestException('Invalid employeeId: Employee not found.');
    }

    // Check if name already exists
    const existing = await this.prisma.parentFishPool.findUnique({
      where: { name: data.name.trim() },
    });

    if (existing) {
      throw new BadRequestException(
        `ParentFishPool with name "${data.name}" already exists.`,
      );
    }

   return this.prisma.parentFishPool.create({
  data: {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    employee: { connect: { id: data.employeeId } }, // ✅ nested relation
  },
  include: { employee: true },
});

  }


async addFishes(poolId: string, count: number) {
  if (typeof count !== 'number' || count <= 0) {
    throw new BadRequestException('Count must be a positive number.');
  }

  // Find the pool first
  const pool = await this.prisma.parentFishPool.findUnique({
    where: { id: poolId },
  });

  if (!pool) {
    throw new NotFoundException('ParentFishPool not found.');
  }

  // Update the numberOfFishes
  const updatedPool = await this.prisma.parentFishPool.update({
    where: { id: poolId },
    data: {
      numberOfFishes: (pool.numberOfFishes || 0) + count,
    },
    include: { employee: true },
  });

  return updatedPool;
}


  // ✅ Find all
  async findAll() {
    return this.prisma.parentFishPool.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });
  }

  // ✅ Find one
  async findOne(id: string) {
    const pool = await this.prisma.parentFishPool.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!pool) throw new NotFoundException('ParentFishPool not found.');
    return pool;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const pool = await this.prisma.parentFishPool.findUnique({ where: { id } });
    if (!pool) throw new NotFoundException('ParentFishPool not found.');

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new BadRequestException('Name must be a non-empty string.');
      }

      // Check for existing name (excluding this record)
      const nameExists = await this.prisma.parentFishPool.findFirst({
        where: {
          name: data.name.trim(),
          NOT: { id },
        },
      });

      if (nameExists) {
        throw new BadRequestException(
          `ParentFishPool with name "${data.name}" already exists.`,
        );
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      throw new BadRequestException('Description must be a string.');
    }

    if (data.employeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: data.employeeId },
      });
      if (!employee) {
        throw new BadRequestException('Invalid employeeId: Employee not found.');
      }
    }

    return this.prisma.parentFishPool.update({
      where: { id },
      data: {
        name: data.name?.trim() ?? pool.name,
        description: data.description?.trim() ?? pool.description,
        employeeId: data.employeeId ?? pool.employeeId,
      },
      include: { employee: true },
    });
  }

  // ✅ Create a new water change for a pool
async createWaterChange(data: any) {
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


  // ✅ Delete
  async remove(id: string) {
    const pool = await this.prisma.parentFishPool.findUnique({ where: { id } });
    if (!pool) throw new NotFoundException('ParentFishPool not found.');

    return this.prisma.parentFishPool.delete({ where: { id } });
  }
}
