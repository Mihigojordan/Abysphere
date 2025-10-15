import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { MedicineService } from './medecine.service';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';

@Controller('medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  async create(@Body() data: any , @Req() req: RequestWithEmployee) {
    try {
      const employeeId = req.employee?.id;
    if (!employeeId) throw new NotFoundException('Employee ID not found in token');
    return this.medicineService.create(data, employeeId)
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(error.message || 'Failed to create medicine');
    };
  }

  @Get()
  async findAll() {
    return this.medicineService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.medicineService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.medicineService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.medicineService.remove(id);
  }
}
