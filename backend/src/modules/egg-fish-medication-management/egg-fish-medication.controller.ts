import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { EggFishMedicationService } from './egg-fish-medication.service';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';

@Controller('egg-fish-medication')
export class EggFishMedicationController {
  constructor(private readonly service: EggFishMedicationService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  async create(@Body() data: any,@Req() req: RequestWithEmployee) {
    try {
        const employeeId = req.employee?.id;
     if (!employeeId) throw new NotFoundException('Employee ID not found in token');
      return await this.service.create(data, employeeId);
    } catch (error) {
        console.log('error', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.service.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.service.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.service.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.service.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
