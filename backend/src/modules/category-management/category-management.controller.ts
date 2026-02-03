import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('category')
export class CategoryManagementController {
    constructor(private readonly categoryService: CategoryManagementService ){}

    //Create Category
  @Post('create')
  async createCategory(@Body() data) {
    return await this.categoryService.createCategory(data);
  }

  //Get All Categories
  @Get('all')
  @UseGuards(AdminJwtAuthGuard)
  async getAllCategories(@Req() req:RequestWithAdmin) {
  const adminId =  req.admin!.id
    return await this.categoryService.getAllCategories(adminId);
  }

  // Get Single Category by ID
  @Get('getone/:id')
  async getCategoryById(@Param('id') id: string) {
    return await this.categoryService.getCategoryById(id);
  }

  //Update Category
  @Put('update/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data,
  ) {
    return await this.categoryService.updateCategory(id, data);
  }

  //Delete Category
  @Delete('delete/:id')
  async deleteCategory(@Param('id') id: string , @Body() data ) {
    return this.categoryService.deleteCategory(id, data);
  }
}
