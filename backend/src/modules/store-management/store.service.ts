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

  async findAll(params?: { page?: number; limit?: number; search?: string }) {
    try {
      const { page = 1, limit = 10, search } = params || {};
      const skip = (page - 1) * limit;

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

      const [stores, total] = await Promise.all([
        this.prisma.store.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include:{
            manager:true
          }
        }),
        this.prisma.store.count({ where }),
      ]);

      return {
        stores,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch stores');
    }
  }

  async findOne(id: string) {
    try {
      const store = await this.prisma.store.findUnique({
         where: { id } ,
          include:{
            manager:true
          }
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
      const store = await this.prisma.store.findMany({ where: 
        { managerId: id } ,
         include:{
            manager:true
          }
      });
      if (!store || store?.length  == 0 ) throw new NotFoundException('Store not found');
      return store;
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
         include:{
            manager:true
          }
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
