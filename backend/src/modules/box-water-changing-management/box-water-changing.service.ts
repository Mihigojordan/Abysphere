import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LaboratoryBoxWaterChangingGateway } from './box-water-changing.gateway';

@Injectable()
export class LaboratoryBoxWaterChangingService {
  constructor(
    private prisma: PrismaService,
    private gateway: LaboratoryBoxWaterChangingGateway,
  ) {}

  async create(data: any, employeeId: string) {
    try {
      const record = await this.prisma.laboratoryBoxWaterChanging.create({
        data: {
          litersChanged: data.litersChanged,
          description: data.description,
          employee: { connect: { id: employeeId } },
          laboratoryBox: { connect: { id: data.boxId } },
        },
        include: { employee: true, laboratoryBox: true },
      });

      this.gateway.emitCreated(record);
      return { message: 'Water change recorded successfully', record };
    } catch (error) {
      console.log('error', error)
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.prisma.laboratoryBoxWaterChanging.findMany({
        include: { employee: true, laboratoryBox: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const record = await this.prisma.laboratoryBoxWaterChanging.findUnique({
        where: { id },
        include: { employee: true, laboratoryBox: true },
      });

      if (!record)
        throw new BadRequestException('Water change record not found');
      return record;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const existing = await this.prisma.laboratoryBoxWaterChanging.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Water change record not found');

      const updated = await this.prisma.laboratoryBoxWaterChanging.update({
        where: { id },
        data,
        include: { employee: true, laboratoryBox: true },
      });

      this.gateway.emitUpdated(updated);
      return { message: 'Water change record updated successfully', updated };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const existing = await this.prisma.laboratoryBoxWaterChanging.findUnique({
        where: { id },
      });
      if (!existing)
        throw new BadRequestException('Water change record not found');

      await this.prisma.laboratoryBoxWaterChanging.delete({ where: { id } });
      this.gateway.emitDeleted(id);

      return { message: 'Water change record deleted successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
