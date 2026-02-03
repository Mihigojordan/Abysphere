import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { LaboratoryBoxService } from './laboratory-box.service';

@Controller('laboratory-box')
export class LaboratoryBoxController {
  constructor(private readonly service: LaboratoryBoxService) {}

  @Post()
  async create(@Body() data: any) {
    try {
      return await this.service.create(data);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.service.update(id, data);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.service.remove(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
