import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupplierManagementService } from './supplier.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('supplier')
export class SupplierManagementController {
  constructor(private readonly supplierService: SupplierManagementService) {}

  // ✅ Create Supplier
  @Post('create')
  @UseGuards(AdminJwtAuthGuard)
  async createSupplier(@Req() req: RequestWithAdmin, @Body() data) {
    const adminId = req.admin!.id;
    return await this.supplierService.createSupplier({ ...data, adminId });
  }

  // ✅ Get All Suppliers
  @Get('all')
  @UseGuards(AdminJwtAuthGuard)
  async getAllSuppliers(@Req() req: RequestWithAdmin) {
    const adminId = req.admin!.id;
    return await this.supplierService.getAllSuppliers(adminId);
  }

  // ✅ Get Supplier by ID
  @Get('getone/:id')
  async getSupplierById(@Param('id') id: string) {
    return await this.supplierService.getSupplierById(id);
  }

  // ✅ Update Supplier
  @Put('update/:id')
  async updateSupplier(@Param('id') id: string, @Body() data) {
    return await this.supplierService.updateSupplier(id, data);
  }

  // ✅ Delete Supplier
  @Delete('delete/:id')
  async deleteSupplier(@Param('id') id: string) {
    return await this.supplierService.deleteSupplier(id);
  }
}
