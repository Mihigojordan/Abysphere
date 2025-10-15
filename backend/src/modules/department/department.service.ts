import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name?: string; description?: string }) {
    try {
      return await this.prisma.department.create({ data });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  async findAll() {
    try {
      return await this.prisma.department.findMany();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findOne(id: string) {
    try {
      const department = await this.prisma.department.findUnique({ where: { id } });
      if (!department) throw new NotFoundException('Department not found');
      return department;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch department');
    }
  }

  async update(id: string, data: { name?: string; description?: string }) {
    try {
      const updated = await this.prisma.department.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update department');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.department.delete({ where: { id } });
      return { message: 'Department deleted successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete department');
    }
  }
}
