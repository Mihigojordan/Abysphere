import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create Department with adminId
  async create(data: { name?: string; description?: string; adminId: string }) {
    try {
      if (!data.adminId) throw new Error('Admin ID is required');
      return await this.prisma.department.create({ data });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  // ✅ Get all departments for this admin
  async findAll(adminId: string) {
    try {
      return await this.prisma.department.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  // ✅ Get one department by ID
  async findOne(id: string) {
    try {
      const department = await this.prisma.department.findUnique({
        where: { id },
        include: { admin: true, employee: true },
      });
      if (!department) throw new NotFoundException('Department not found');
      return department;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch department');
    }
  }

  // ✅ Update department
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

  // ✅ Delete department
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
