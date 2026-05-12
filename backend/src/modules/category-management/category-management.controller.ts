import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('category')
export class CategoryManagementController {
  constructor(private readonly categoryService: CategoryManagementService) {}

  @Post('create')
  async createCategory(@Body() data) {
    return await this.categoryService.createCategory(data);
  }

  @Get('all')
  @UseGuards(DualAuthGuard)
  async getAllCategories(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.categoryService.getAllCategories(adminId);
  }

  @Get('getone/:id')
  async getCategoryById(@Param('id') id: string) {
    return await this.categoryService.getCategoryById(id);
  }

  @Put('update/:id')
  async updateCategory(@Param('id') id: string, @Body() data) {
    return await this.categoryService.updateCategory(id, data);
  }

  @Delete('delete/:id')
  async deleteCategory(@Param('id') id: string, @Body() data) {
    return this.categoryService.deleteCategory(id, data);
  }
}
