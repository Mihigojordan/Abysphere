import {
  BadRequestException,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SupplierManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  // ✅ Create Supplier
  async createSupplier(data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    adminId: string;
  }) {
    try {
      const { name, email, phone, adminId, address } = data;

      if (!name) throw new BadRequestException('Supplier name is required');
      if (!adminId) throw new BadRequestException('Admin ID is required');

      // Check duplicates
      const existingSupplier = await this.prismaService.supplier.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      });

      if (existingSupplier) {
        throw new BadRequestException('Supplier with this email or phone already exists');
      }

      const createdSupplier = await this.prismaService.supplier.create({
        data: { name, email, phone, address, adminId },
      });

      return {
        message: 'Supplier created successfully',
        supplier: createdSupplier,
      };
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Get all suppliers for an admin
  async getAllSuppliers(adminId: string) {
    try {
      if (!adminId) throw new BadRequestException('Admin ID is required');

      const suppliers = await this.prismaService.supplier.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' },
      });

      return suppliers;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Get single supplier by ID
  async getSupplierById(id: string) {
    try {
      if (!id) throw new BadRequestException('Supplier ID is required');

      const supplier = await this.prismaService.supplier.findUnique({
        where: { id },
      });

      if (!supplier) throw new BadRequestException('Supplier not found');

      return supplier;
    } catch (error) {
      console.error('Error getting supplier:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Update supplier
  async updateSupplier(
    id: string,
    data: { name?: string; email?: string; phone?: string; address?: string },
  ) {
    try {
      if (!id) throw new BadRequestException('Supplier ID is required');

      const existingSupplier = await this.prismaService.supplier.findUnique({
        where: { id },
      });

      if (!existingSupplier) throw new BadRequestException('Supplier not found');

      const updatedSupplier = await this.prismaService.supplier.update({
        where: { id },
        data: {
          name: data.name ?? existingSupplier.name,
          email: data.email ?? existingSupplier.email,
          phone: data.phone ?? existingSupplier.phone,
          address: data.address ?? existingSupplier.address,
        },
      });

      return {
        message: 'Supplier updated successfully',
        supplier: updatedSupplier,
      };
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // ✅ Delete supplier
  async deleteSupplier(id: string) {
    try {
      if (!id) throw new BadRequestException('Supplier ID is required');
      console.log('logging id',id);
      
      
      const existingSupplier = await this.prismaService.supplier.findUnique({
        where: { id },
      });

      if (!existingSupplier) throw new BadRequestException('Supplier not found');


      const deleted = await this.prismaService.supplier.delete({
        where: { id },
      });

      return {
        message: 'Supplier deleted successfully',
        supplier: deleted,
      };
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
