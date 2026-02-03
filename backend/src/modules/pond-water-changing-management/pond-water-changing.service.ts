import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PondWaterChangingGateway } from './pond-water-changing.gateway';

@Injectable()
export class PondWaterChangingService {
  constructor(
    private prisma: PrismaService,
    private gateway: PondWaterChangingGateway,
  ) {}

  async create(data: any, employeeId: string) {
    try {
      const record = await this.prisma.pondWaterChanging.create({
        data: {
          litersChanged: data.litersChanged,
          description: data.description,
          employee: { connect: { id: employeeId } },
          eggToPondMigration: { connect: { id: data.EggtoPondId } },
        },
        include: { employee: true, eggToPondMigration: true },
      });

      this.gateway.emitCreated(record);
      return { message: 'Pond water change recorded successfully', record };
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.pondWaterChanging.findMany({
        include: { employee: true, eggToPondMigration: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.prisma.pondWaterChanging.findUnique({
        where: { id },
        include: { employee: true, eggToPondMigration: true },
      });

      if (!record)
        throw new BadRequestException('Pond water change record not found');
      return record;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const existing = await this.prisma.pondWaterChanging.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Pond water change record not found');

      const updateData: any = {
        litersChanged: data.litersChanged,
        description: data.description,
      };

      if (data.EggtoPondId) {
        updateData.eggToPondMigration = { connect: { id: data.EggtoPondId } };
      }

      const updated = await this.prisma.pondWaterChanging.update({
        where: { id },
        data: updateData,
        include: { employee: true, eggToPondMigration: true },
      });

      this.gateway.emitUpdated(updated);
      return { message: 'Pond water change record updated successfully', updated };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.pondWaterChanging.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Pond water change record not found');

      await this.prisma.pondWaterChanging.delete({ where: { id } });
      this.gateway.emitDeleted(id);

      return { message: 'Pond water change record deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
