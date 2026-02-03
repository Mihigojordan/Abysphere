import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Req } from '@nestjs/common';
import { EggFishFeedingService } from './egg-fish-feeding.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('egg-fish-feeding')
export class EggFishFeedingController {
  constructor(private readonly service: EggFishFeedingService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  create(@Body() body: any, @Req() req: RequestWithEmployee) {
    body.employeeId = req.employee.id;
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
