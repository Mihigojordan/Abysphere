import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(
    @Body()
    body: {
      code: string;
      name: string;
      location: string;
      description?: string;
      manager_name?: string;
      contact_phone?: string;
      contact_email?: string;
    },
  ) {
    return await this.storeService.create(body);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return await this.storeService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.storeService.findOne(id);
  }
  @Get('manager/:id')
  async findStoresByManagerId(@Param('id') id: string) {
    return await this.storeService.findStoresByManagerId(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      code?: string;
      name?: string;
      location?: string;
      description?: string;
      manager_name?: string;
      contact_phone?: string;
      contact_email?: string;
    },
  ) {
    return await this.storeService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.storeService.remove(id);
  }
}
