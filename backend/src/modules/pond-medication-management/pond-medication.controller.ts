import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { PondMedicationService } from './pond-medication.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('pond-medication')
export class PondMedicationController {
  constructor(private readonly pondMedicationService: PondMedicationService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  create(@Body() data: any, @Req() req: RequestWithEmployee) {
    const employeeId = req.employee?.id;
    if (!employeeId)
      throw new NotFoundException('Employee ID not found in token');

    return this.pondMedicationService.create(data, employeeId);
  }

  @Get()
  findAll() {
    return this.pondMedicationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pondMedicationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.pondMedicationService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pondMedicationService.remove(id);
  }
}
