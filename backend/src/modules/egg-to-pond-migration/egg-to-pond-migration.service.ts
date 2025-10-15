import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EggToPondMigrationService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    if (!data.parentEggMigrationId) throw new BadRequestException('parentEggMigrationId is required.');
    if (!data.pondId) throw new BadRequestException('pondId is required.');
    if (!data.employeeId) throw new BadRequestException('employeeId is required.');

    const [parentMigration, pond, employee] = await Promise.all([
      this.prisma.parentEggMigration.findUnique({ where: { id: data.parentEggMigrationId } }),
      this.prisma.grownEggPond.findUnique({ where: { id: data.pondId } }),
      this.prisma.employee.findUnique({ where: { id: data.employeeId } }),
    ]);

    if (!parentMigration) throw new BadRequestException('Invalid parentEggMigrationId.');
    if (!pond) throw new BadRequestException('Invalid pondId.');
    if (!employee) throw new BadRequestException('Invalid employeeId.');

    return this.prisma.eggToPondMigration.create({
      data: {
        parentEggMigrationId: data.parentEggMigrationId,
        pondId: data.pondId,
        employeeId: data.employeeId,
        description: data.description?.trim() || null,
        date: data.date ? new Date(data.date) : undefined,
        status: data.status?.toUpperCase() || 'ACTIVE',
      },
      include: { parentEggMigration: true, pond: true, employee: true },
    });
  }

  async findAll() {
    return this.prisma.eggToPondMigration.findMany({
      orderBy: { date: 'desc' },
      include: { parentEggMigration: true, pond: true, employee: true },
    });
  }

  async findOne(id: string) {
    const migration = await this.prisma.eggToPondMigration.findUnique({
      where: { id },
      include: { parentEggMigration: true, pond: true, employee: true },
    });
    if (!migration) throw new NotFoundException('EggToPondMigration not found.');
    return migration;
  }

  async update(id: string, data: any) {
    const migration = await this.prisma.eggToPondMigration.findUnique({ where: { id } });
    if (!migration) throw new NotFoundException('Migration not found.');

    return this.prisma.eggToPondMigration.update({
      where: { id },
      data: {
        description: data.description?.trim() ?? migration.description,
        date: data.date ? new Date(data.date) : migration.date,
        status: data.status?.toUpperCase() ?? migration.status,
      },
      include: { parentEggMigration: true, pond: true, employee: true },
    });
  }

  async remove(id: string) {
    const migration = await this.prisma.eggToPondMigration.findUnique({ where: { id } });
    if (!migration) throw new NotFoundException('Migration not found.');
    return this.prisma.eggToPondMigration.delete({ where: { id } });
  }
}
