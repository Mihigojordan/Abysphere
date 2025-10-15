import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MedicationService } from './medication.service';

@Controller('medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  async create(@Body() body: any) {
    try {
      console.log(body);
      
      return await this.medicationService.create(body);
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.medicationService.findAll();
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.medicationService.findOne(id);
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
  @Get('cage/:id')
  async findAllByCageId(@Param('id') id: string) {
    try {
      return await this.medicationService.findAllByCageId(id);
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.medicationService.update(id, body);
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.medicationService.remove(id);
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
