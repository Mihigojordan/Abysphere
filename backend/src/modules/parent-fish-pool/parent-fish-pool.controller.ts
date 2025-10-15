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
} from '@nestjs/common';
import { ParentFishPoolService } from './parent-fish-pool.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('parent-fish-pools')
export class ParentFishPoolController {
  constructor(private readonly parentFishPoolService: ParentFishPoolService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
  create(@Body() body: any, @Req() req: RequestWithEmployee) {
    const employeeId = req.employee.id;
    body['employeeId'] = employeeId;
    return this.parentFishPoolService.create(body);
  }

  @Get()
  findAll() {
    return this.parentFishPoolService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentFishPoolService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.parentFishPoolService.update(id, body);
  }

  @Post(':id/add-fishes')
  async addFishes(@Param('id') id: string, @Body('count') count: number) {
    return this.parentFishPoolService.addFishes(id, count);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parentFishPoolService.remove(id);
  }

  // ✅ Create a water change for a specific pool
  @Post(':id/water-change')
  @UseGuards(EmployeeJwtAuthGuard)
  createWaterChange(
    @Param('id') poolId: string,
    @Body() body: any,
    @Req() req: RequestWithEmployee,
  ) {
    const employeeId = req.employee.id;
    body.parentPoolId = poolId;
    body.employeeId = employeeId;
    return this.parentFishPoolService.createWaterChange(body);
  }
}
