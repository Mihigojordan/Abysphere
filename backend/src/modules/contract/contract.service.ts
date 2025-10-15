import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.contract.create({data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
    }});
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: { employee: true },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }


  async findByEmployeeId(employeeId: string) {
    return this.prisma.contract.findMany({
      where: { employeeId },
      include: { employee: true },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.contract.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.contract.delete({
      where: { id },
    });
  }
}
