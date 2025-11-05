import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { MembershipPlanService } from './membership-plan.service';

@Controller('membership-plans')
// @UseGuards(AdminJwtAuthGuard) // Still protects route
export class MembershipPlanController {
  constructor(private readonly planService: MembershipPlanService) {}

  @Post()
  create(@Body() body: any) {
    return this.planService.create(body);
  }

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.planService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planService.remove(id);
  }
}
