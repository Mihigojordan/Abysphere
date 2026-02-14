import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SupplierService, CreateSupplierDto, UpdateSupplierDto, SupplierFilterDto } from './supplier.service';
import { SupplierStatus } from '../../../generated/prisma';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { Req } from '@nestjs/common';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) { }

  @Post()
  @UseGuards(AdminJwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: RequestWithAdmin, @Body() createDto: CreateSupplierDto) {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin ID not found in request');
    }
    return this.supplierService.create(createDto, adminId);
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  async findAll(@Query() filters: SupplierFilterDto, @Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin ID not found in request');
    }
    return this.supplierService.findAll(filters, adminId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateSupplierDto) {
    return this.supplierService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.supplierService.remove(id);
  }

  @Get(':id/performance')
  async getPerformance(@Param('id') id: string) {
    return this.supplierService.getPerformance(id);
  }

  @Get(':id/price-history')
  async getPriceHistory(
    @Param('id') id: string,
    @Query('productName') productName?: string,
  ) {
    return this.supplierService.getPriceHistory(id, productName);
  }

  @Post('import')
  @UseGuards(AdminJwtAuthGuard)
  async bulkImport(@Req() req: RequestWithAdmin, @Body() suppliers: CreateSupplierDto[]) {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin ID not found in request');
    }
    return this.supplierService.bulkImport(suppliers, adminId);
  }

  @Get('export/all')
  @UseGuards(AdminJwtAuthGuard)
  async export(@Query() filters: SupplierFilterDto, @Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id;
    if (!adminId) {
      throw new BadRequestException('Admin ID not found in request');
    }
    return this.supplierService.export(filters, adminId);
  }
}
