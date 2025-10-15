import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ParentEggMigrationService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create
  async create(data: any) {
    // Basic validation
    if (!data.parentPoolId || typeof data.parentPoolId !== 'string') {
      throw new BadRequestException('parentPoolId is required and must be a string.');
    }

    if (!data.laboratoryBoxId || typeof data.laboratoryBoxId !== 'string') {
      throw new BadRequestException('laboratoryBoxId is required and must be a string.');
    }

    if (!data.employeeId || typeof data.employeeId !== 'string') {
      throw new BadRequestException('employeeId is required and must be a string.');
    }

    // Check foreign keys
    const [pool, box, employee] = await Promise.all([
      this.prisma.parentFishPool.findUnique({ where: { id: data.parentPoolId } }),
      this.prisma.laboratoryBox.findUnique({ where: { id: data.laboratoryBoxId } }),
      this.prisma.employee.findUnique({ where: { id: data.employeeId } }),
    ]);

    if (!pool) throw new BadRequestException('Invalid parentPoolId.');
    if (!box) throw new BadRequestException('Invalid laboratoryBoxId.');
    if (!employee) throw new BadRequestException('Invalid employeeId.');

    // Create migration record
    return this.prisma.parentEggMigration.create({
      data: {
        parentPoolId: data.parentPoolId,
        laboratoryBoxId: data.laboratoryBoxId,
        employeeId: data.employeeId,
        description: data.description?.trim() || null,
      
        status: 'ACTIVE'
      },
      include: { parentPool: true, laboratoryBox: true, employee: true },
    });
  }

  // ✅ Get all
  async findAll() {
    return this.prisma.parentEggMigration.findMany({
      orderBy: { date: 'desc' },
      include: { parentPool: true, laboratoryBox: true, employee: true },
    });
  }

  // ✅ Get one
  async findOne(id: string) {
    const migration = await this.prisma.parentEggMigration.findUnique({
      where: { id },
      include: { parentPool: true, laboratoryBox: true, employee: true },
    });

    if (!migration) throw new NotFoundException('ParentEggMigration not found.');
    return migration;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const migration = await this.prisma.parentEggMigration.findUnique({ where: { id } });
    if (!migration) throw new NotFoundException('ParentEggMigration not found.');

    if (data.parentPoolId) {
      const pool = await this.prisma.parentFishPool.findUnique({ where: { id: data.parentPoolId } });
      if (!pool) throw new BadRequestException('Invalid parentPoolId.');
    }

    if (data.laboratoryBoxId) {
      const box = await this.prisma.laboratoryBox.findUnique({ where: { id: data.laboratoryBoxId } });
      if (!box) throw new BadRequestException('Invalid laboratoryBoxId.');
    }

    if (data.employeeId) {
      const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
      if (!employee) throw new BadRequestException('Invalid employeeId.');
    }

    return this.prisma.parentEggMigration.update({
      where: { id },
      data: {
        parentPoolId: data.parentPoolId ?? migration.parentPoolId,
        laboratoryBoxId: data.laboratoryBoxId ?? migration.laboratoryBoxId,
        employeeId: data.employeeId ?? migration.employeeId,
        description: data.description?.trim() ?? migration.description,
        status: data.status ?? undefined,
      },
      include: { parentPool: true, laboratoryBox: true, employee: true },
    });
  }

  // ✅ Delete
  async remove(id: string) {
    const migration = await this.prisma.parentEggMigration.findUnique({ where: { id } });
    if (!migration) throw new NotFoundException('ParentEggMigration not found.');

    return this.prisma.parentEggMigration.delete({ where: { id } });
  }
}
