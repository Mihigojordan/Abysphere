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
} from '@nestjs/common';
import { SupplierService, CreateSupplierDto, UpdateSupplierDto, SupplierFilterDto } from './supplier.service';
import { SupplierStatus } from '../../../generated/prisma';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSupplierDto) {
    return this.supplierService.create(createDto);
  }

  @Get()
  async findAll(@Query() filters: SupplierFilterDto) {
    return this.supplierService.findAll(filters);
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
  async bulkImport(@Body() suppliers: CreateSupplierDto[]) {
    return this.supplierService.bulkImport(suppliers);
  }

  @Get('export/all')
  async export(@Query() filters: SupplierFilterDto) {
    return this.supplierService.export(filters);
  }
}
