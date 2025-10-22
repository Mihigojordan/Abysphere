import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { SystemFeaturesService } from './system-features.service';

@Controller('system-features')
export class SystemFeaturesController {
  constructor(private readonly systemFeaturesService: SystemFeaturesService) {}

  @Post()
  create(@Body() data: { name: string; description?: string }) {
    return this.systemFeaturesService.create(data);
  }

  @Get()
  findAll() {
    return this.systemFeaturesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemFeaturesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; description?: string }) {
    return this.systemFeaturesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.systemFeaturesService.remove(id);
  }
}