import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CageService {
  constructor(private prisma: PrismaService) {}

 async create(data: any) {
  try {
    console.log("Before create:", data);

    // Ensure stockingDate is a Date object
    if (data.stockingDate) {
      data.stockingDate = new Date(data.stockingDate);
    }

    const cage = await this.prisma.cage.create({ data });
    console.log(cage);
    return cage
    
  } catch (error) {
    console.error("Prisma error:", error);
    throw new BadRequestException(error.message);
  }
}


  async findAll() {
    try {
      return await this.prisma.cage.findMany();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      const cage = await this.prisma.cage.findUnique({ where: { id } });
      if (!cage) throw new NotFoundException('Cage not found');
      return cage;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, data: any) {
    try {
      const cage = await this.prisma.cage.findUnique({ where: { id } });
      if (!cage) throw new NotFoundException('Cage not found');

       if (data.stockingDate) {
      data.stockingDate = new Date(data.stockingDate);
    }

      return await this.prisma.cage.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const cage = await this.prisma.cage.findUnique({ where: { id } });
      if (!cage) throw new NotFoundException('Cage not found');

      return await this.prisma.cage.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
