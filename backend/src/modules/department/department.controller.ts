import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('departments')
@UseGuards(AdminJwtAuthGuard) // ✅ Protect all endpoints with admin guard
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  // ✅ Create Department (with adminId from token)
  @Post()
  async create(@Req() req: RequestWithAdmin, @Body() body: { name?: string; description?: string }) {
    const adminId = req.admin!.id;
    return await this.departmentService.create({ ...body, adminId });
  }

  // ✅ Get all departments belonging to the admin
  @Get()
  async findAll(@Req() req: RequestWithAdmin) {
    const adminId = req.admin!.id;
    return await this.departmentService.findAll(adminId);
  }

  // ✅ Get one department by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.departmentService.findOne(id);
  }

  // ✅ Update department
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { name?: string; description?: string }) {
    return await this.departmentService.update(id, body);
  }

  // ✅ Delete department
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.departmentService.remove(id);
  }
}
