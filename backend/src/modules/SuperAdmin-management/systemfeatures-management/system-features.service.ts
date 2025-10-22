import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SystemFeaturesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string }) {
    try {
      return await this.prisma.systemFeature.create({ data });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create system feature');
    }
  }

  async findAll() {
    try {
      return await this.prisma.systemFeature.findMany();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch system features');
    }
  }

  async findOne(id: string) {
    try {
      const feature = await this.prisma.systemFeature.findUnique({ where: { id } });
      if (!feature) throw new NotFoundException('System feature not found');
      return feature;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException ? error : new InternalServerErrorException('Failed to fetch system feature');
    }
  }

  async update(id: string, data: { name?: string; description?: string }) {
    try {
      const updated = await this.prisma.systemFeature.update({
        where: { id },
        data,
      });
      return updated;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update system feature');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.systemFeature.delete({ where: { id } });
      return { message: 'System feature deleted successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete system feature');
    }
  }
}