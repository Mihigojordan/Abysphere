import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { SalesReturnService } from './salesReturn.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('sales-return')
export class SalesReturnController {
  constructor(private readonly salesReturnService: SalesReturnService) {}

  @Post('create')
     @UseGuards(AdminJwtAuthGuard)
  async create(@Body() data,@Req() req: RequestWithAdmin) {
    data.adminId = req.admin?.id
    return this.salesReturnService.create(data);
  }

  @Get()
   @UseGuards(AdminJwtAuthGuard)
  async findAll(@Req() req: RequestWithAdmin) {
    
    return this.salesReturnService.findAll(req.admin!.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salesReturnService.findOne(id);
  }
}