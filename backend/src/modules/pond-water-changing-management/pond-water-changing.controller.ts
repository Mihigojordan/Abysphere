import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PondWaterChangingService } from './pond-water-changing.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('pond-water-changing')
export class PondWaterChangingController {
  constructor(private readonly service: PondWaterChangingService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  async create(@Body() data: any, @Req() req: RequestWithEmployee) {
    try {
      const employeeId = req.employee?.id;
      if (!employeeId)
        throw new NotFoundException('Employee ID not found in token');

      return this.service.create(data, employeeId);
    } catch (error) {
      console.log('error', error);
      throw new BadRequestException(
        error.message || 'Failed to record pond water change',
      );
    }
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
