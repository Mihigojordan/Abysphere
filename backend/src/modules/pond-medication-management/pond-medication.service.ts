import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PondMedicationGateway } from './pond-medication.gateway';

@Injectable()
export class PondMedicationService {
  constructor(
    private prisma: PrismaService,
    private gateway: PondMedicationGateway,
  ) {}

  async create(data: any, employeeId: string) {
    try {
      // Validate employee
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (!employee) throw new BadRequestException('Employee not found');

      // Validate eggToPondMigration
      const migration = await this.prisma.eggToPondMigration.findUnique({
        where: { id: data.eggtoPondId },
      });
      if (!migration)
        throw new BadRequestException('EggToPondMigration not found');

      // Validate medication
      const med = await this.prisma.medicine.findUnique({
        where: { id: data.medicationId },
      });
      if (!med) throw new BadRequestException('Medicine not found');
      const record = await this.prisma.pondMedication.create({
        data: {
          quantity: data.quantity,
          employee: { connect: { id: employeeId } },
          medication: { connect: { id: data.medicationId } },
          eggToPondMigration: { connect: { id: data.eggtoPondId } },
        },
        include: {
          employee: true,
          medication: true,
          eggToPondMigration: true,
        },
      });

      this.gateway.emitCreated(record);
      return { message: 'Pond medication record created successfully', record };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.pondMedication.findMany({
        include: {
          employee: true,
          medication: true,
          eggToPondMigration: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.prisma.pondMedication.findUnique({
        where: { id },
        include: {
          employee: true,
          medication: true,
          eggToPondMigration: true,
        },
      });
      if (!record)
        throw new BadRequestException('Pond medication record not found');
      return record;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const existing = await this.prisma.pondMedication.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Pond medication record not found');

      const updated = await this.prisma.pondMedication.update({
        where: { id },
        data,
        include: {
          employee: true,
          medication: true,
          eggToPondMigration: true,
        },
      });

      this.gateway.emitUpdated(updated);
      return {
        message: 'Pond medication record updated successfully',
        updated,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.pondMedication.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Pond medication record not found');

      await this.prisma.pondMedication.delete({ where: { id } });
      this.gateway.emitDeleted(id);

      return { message: 'Pond medication record deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
