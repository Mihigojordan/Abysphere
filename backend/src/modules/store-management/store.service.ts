import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      const { id, created_at, updated_at, ...storeData } = data;
      return await this.prisma.store.create({ data: storeData });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create store');
    }
  }

  async findAll(params?: { search?: string; adminId?: string }) {
    try {
      const { search, adminId } = params || {};

      const where = {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(adminId ? { adminId } : {}),
      };

      const stores = await this.prisma.store.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include: { manager: true, admin: true },
      });

      return stores;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch stores');
    }
  }

  async findOne(id: string) {
    try {
      const store = await this.prisma.store.findUnique({
        where: { id },
        include: { manager: true, admin: true },
      });
      if (!store) throw new NotFoundException('Store not found');
      return store;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch store');
    }
  }

  async findStoresByManagerId(id: string) {
    try {
      const stores = await this.prisma.store.findMany({
        where: { managerId: id },
        include: { manager: true, admin: true },
      });
      if (!stores || stores.length === 0)
        throw new NotFoundException('No stores found for this manager');
      return stores;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch store');
    }
  }

  async update(id: string, data: any) {
    try {
      return await this.prisma.store.update({
        where: { id },
        data,
        include: { manager: true, admin: true },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update store');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.store.delete({ where: { id } });
      return { message: 'Store deleted successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete store');
    }
  }
}
