import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { SalesReturnService } from './salesReturn.service';
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('sales-return')
export class SalesReturnController {
  constructor(private readonly salesReturnService: SalesReturnService) {}

  @Post('create')
  @UseGuards(DualAuthGuard)
  async create(@Body() data, @Req() req: RequestWithAdminEmployee) {
    data.adminId = req.admin?.id ?? req.employee?.adminId;
    data.employeeId = req.employee?.id ?? null;
    return this.salesReturnService.create(data);
  }

  @Get()
  @UseGuards(DualAuthGuard)
  async findAll(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return this.salesReturnService.findAll(adminId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesReturnService.findOne(id);
  }
}
