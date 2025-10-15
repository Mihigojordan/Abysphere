import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Medication,  } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<Medication> {
    console.log('nigro :',data);
    try {
      // ensure dates are valid
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);

      

      return await this.prisma.medication.create({ data });
    } catch (error) {
      console.error('Create medication error:', error);
      throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Medication[]> {
    try {
      return await this.prisma.medication.findMany({
        include: {
          cage: true,
          employee: true,
          admin:true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllByCageId(cageId: string): Promise<Medication[]> {
    try {
      return await this.prisma.medication.findMany({
        where: { cageId }, // ✅ correct field
        include: {
          cage: true,
          employee: true,
          admin:true
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string): Promise<Medication> {
    try {
      const med = await this.prisma.medication.findUnique({
        where: { id },
        include: {
          cage: true,
          employee: true,
          admin:true,
        },
      });
      if (!med) throw new NotFoundException('Medication not found');
      return med;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any): Promise<Medication> {
    try {
      if (data.startDate) data.startDate = new Date(data.startDate);
      if (data.endDate) data.endDate = new Date(data.endDate);

      return await this.prisma.medication.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string): Promise<Medication> {
    try {
      return await this.prisma.medication.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
