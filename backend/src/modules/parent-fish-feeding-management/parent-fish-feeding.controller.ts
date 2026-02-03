import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ParentFishFeedingService } from './parent-fish-feeding.service';
import { EmployeeJwtAuthGuard } from '../../guards/employeeGuard.guard';
import { RequestWithEmployee } from '../../common/interfaces/employee.interface';

@Controller('parent-fish-feeding')
export class ParentFishFeedingController {
  constructor(private readonly feedingService: ParentFishFeedingService) {}
  
  @Post()
  @UseGuards(EmployeeJwtAuthGuard) // apply guard to all routes
  async create(@Body() data: any, @Req() req: RequestWithEmployee) {
    // take employeeId from logged-in user
    const employeeId = req.employee.id;

    return this.feedingService.create({
      ...data,
      employeeId,
    });
  }

  @Get()
  findAll() {
    return this.feedingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feedingService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: RequestWithEmployee,
  ) {
    const employeeId = req.employee.id;

    // optionally override employeeId if you want to track last updater
    return this.feedingService.update(id, {
      ...data,
      employeeId,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feedingService.remove(id);
  }
}
