import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CageService } from './cage.service';

@Controller('cages')
export class CageController {
  constructor(private readonly cageService: CageService) {}

  @Post()
  async create(@Body() data: any) {
    try {
      return await this.cageService.create(data);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.cageService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.cageService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.cageService.update(id, data);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.cageService.remove(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
