import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ParentFishMedicationService } from './parent-fish-medication.service';
import { EmployeeJwtAuthGuard } from '../../guards/employeeGuard.guard';
import { RequestWithEmployee } from '../../common/interfaces/employee.interface';

@Controller('parent-fish-medication')
export class ParentFishMedicationController {
  constructor(private readonly service: ParentFishMedicationService) {}

  @UseGuards(EmployeeJwtAuthGuard)
  @Post()
  create(@Body() data: any, @Req() req: RequestWithEmployee) {
    // employee ID comes from the decoded JWT (guard)
    const employeeId = req.employee.id;
    return this.service.create({ ...data, employeeId });
  }

  @UseGuards(EmployeeJwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(EmployeeJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(EmployeeJwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @UseGuards(EmployeeJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
