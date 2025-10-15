import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ParentWaterChangingService } from './parent-water-changing.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('parent-water-changing')
export class ParentWaterChangingController {
  constructor(private readonly waterService: ParentWaterChangingService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  create(@Body() body: any, @Req() req: RequestWithEmployee) {
    body.employeeId = req.employee.id;
    return this.waterService.create(body);
  }

  @Get()
  findAll() {
    return this.waterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waterService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.waterService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.waterService.remove(id);
  }
}
