import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, AssetStatus, AssetCategory } from '../../../generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) { }

  async create(assetData: {
    name: string;
    category: AssetCategory;
    description?: string;
    assetImg?: string;
    location?: string;
    quantity: string;
    purchaseDate?: Date;
    purchaseCost?: number;
    status?: AssetStatus;
  }) {
    try {
      // Validate required fields
      if (!assetData.name || !assetData.category || !assetData.quantity) {
        throw new BadRequestException('Name, category, and quantity are required');
      }

      const dataToInsert: Prisma.AssetCreateInput = {
        name: assetData.name,
        category: assetData.category,
        description: assetData.description,
        assetImg: assetData.assetImg,
        location: assetData.location,
        quantity: assetData.quantity,
        purchaseDate: assetData.purchaseDate || new Date(),
        purchaseCost: Number(assetData.purchaseCost),
        status: assetData.status || AssetStatus.ACTIVE,
      };

      return await this.prisma.asset.create({ data: dataToInsert });
    } catch (error) {
      console.error(error);
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to create asset');
    }
  }

  async findAll() {
    try {
      return await this.prisma.asset.findMany();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch assets');
    }
  }

  async findOne(id: string) {
    try {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) throw new NotFoundException('Asset not found');
      return asset;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch asset');
    }
  }

  async update(
    id: string,
    assetData: {
      name?: string;
      category?: AssetCategory;
      description?: string;
      assetImg?: string;
      location?: string;
      quantity?: string;
      purchaseDate?: Date;
      purchaseCost?: number;
      status?: AssetStatus;
    },
  ) {
    try {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      const dataToUpdate: Prisma.AssetUpdateInput = {
        name: assetData.name,
        category: assetData.category,
        description: assetData.description,
        assetImg: assetData.assetImg,
        location: assetData.location,
        quantity: assetData.quantity,
        purchaseDate: assetData.purchaseDate,
        purchaseCost: Number(assetData.purchaseCost),
        status: assetData.status,
      };

      return await this.prisma.asset.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to update asset');
    }
  }

  async updateStatus(
    id: string,
    data: {
      status: AssetStatus
    }
  ) {
    try {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      return await this.prisma.asset.update({
        where: { id },
        data: { status: data.status },
      });
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update asset status');
    }
  }

  async remove(id: string) {
    try {
      const asset = await this.prisma.asset.findUnique({ where: { id } });
      if (!asset) {
        throw new NotFoundException('Asset not found');
      }

      await this.prisma.asset.delete({ where: { id } });
      return { message: 'Asset deleted successfully' };
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete asset');
    }
  }
}
