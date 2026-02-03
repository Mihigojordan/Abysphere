import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { FeedstockService } from './feedstock.service';

@Controller('feedstock')
export class FeedstockController {
  constructor(private readonly feedstockService: FeedstockService) {}

  @Post()
  create(@Body() body: { name: string; quantity?: number; lowStockLevel?: number; category?: string }) {
    return this.feedstockService.create(body);
  }

  @Get()
  findAll() {
    return this.feedstockService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedstockService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.feedstockService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedstockService.remove(id);
  }
}
