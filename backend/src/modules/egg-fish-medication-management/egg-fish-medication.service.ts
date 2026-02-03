import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EggFishMedicationGateway } from './egg-fish-medication.gateway';

@Injectable()
export class EggFishMedicationService {
  constructor(
    private prisma: PrismaService,
    private gateway: EggFishMedicationGateway,
  ) {}

  // ✅ Create new record
  async create(data: any, employeeId: string) {
    try {
      // Validation
      if (!data.parentEggMigrationId)
        throw new BadRequestException('parentEggMigrationId is required.');
      if (!data.medicationId)
        throw new BadRequestException('medicationId is required.');
      if (!employeeId)
        throw new BadRequestException('employeeId is required.');

      // Check related records exist
      const [migration, medication, employee] = await Promise.all([
        this.prisma.parentEggMigration.findUnique({ where: { id: data.parentEggMigrationId } }),
        this.prisma.medicine.findUnique({ where: { id: data.medicationId } }),
        this.prisma.employee.findUnique({ where: { id: employeeId } }),
      ]);

      if (!migration) throw new BadRequestException('ParentEggMigration not found.');
      if (!medication) throw new BadRequestException('Medicine not found.');
      if (!employee) throw new BadRequestException('Employee not found.');

      const created = await this.prisma.eggFishMedication.create({
        data: {
          ParentEggMigration: { connect: { id: data.parentEggMigrationId } },
          medication: { connect: { id: data.medicationId } },
          employee: { connect: { id: employeeId }},
          quantity: data.quantity ?? 0,
        },
        include: { employee: true, medication: true, ParentEggMigration: true },
      });

      this.gateway.broadcastChange('create', created);
      return created;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Find all
  async findAll() {
    try {
      return await this.prisma.eggFishMedication.findMany({
        orderBy: { createdAt: 'desc' },
        include: { employee: true, medication: true, ParentEggMigration: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Find one
  async findOne(id: string) {
    try {
      const record = await this.prisma.eggFishMedication.findUnique({
        where: { id },
        include: { employee: true, medication: true, ParentEggMigration: true },
      });

      if (!record) throw new NotFoundException('EggFishMedication not found.');
      return record;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Update
  async update(id: string, data: any) {
    try {
      const existing = await this.prisma.eggFishMedication.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('EggFishMedication not found.');

      const updated = await this.prisma.eggFishMedication.update({
        where: { id },
        data: {
          parentEggMigrationId: data.parentEggMigrationId ?? existing.parentEggMigrationId,
          medicationId: data.medicationId ?? existing.medicationId,
          employeeId: data.employeeId ?? existing.employeeId,
          quantity: data.quantity ?? existing.quantity,
        },
        include: { employee: true, medication: true, ParentEggMigration: true },
      });

      this.gateway.broadcastChange('update', updated);
      return updated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Delete
  async remove(id: string) {
    try {
      const existing = await this.prisma.eggFishMedication.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('EggFishMedication not found.');

      const deleted = await this.prisma.eggFishMedication.delete({ where: { id } });

      this.gateway.broadcastChange('delete', deleted);
      return deleted;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
