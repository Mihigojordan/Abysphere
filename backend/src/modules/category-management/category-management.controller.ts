import { Body, Controller, Delete, Get, Param, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CategoryManagementService } from './category-management.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { CategoryFileFields, CategoryUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('category')
export class CategoryManagementController {
    constructor(private readonly categoryService: CategoryManagementService ){}

    //Create Category
  @Post('create')
  @UseInterceptors(FileFieldsInterceptor(CategoryFileFields, CategoryUploadConfig))
  async createCategory(
    @Body() data,
    @UploadedFiles() files?: { categoryImg?: Express.Multer.File[] },
  ) {
    if (files?.categoryImg?.[0]?.filename) {
      data.image = `/uploads/category_images/${files.categoryImg[0].filename}`;
    }
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
  @UseInterceptors(FileFieldsInterceptor(CategoryFileFields, CategoryUploadConfig))
  async updateCategory(
    @Param('id') id: string,
    @Body() data,
    @UploadedFiles() files?: { categoryImg?: Express.Multer.File[] },
  ) {
    if (files?.categoryImg?.[0]?.filename) {
      data.image = `/uploads/category_images/${files.categoryImg[0].filename}`;
    }
    return await this.categoryService.updateCategory(id, data);
  }

  //Delete Category
  @Delete('delete/:id')
  async deleteCategory(@Param('id') id: string , @Body() data ) {
    return this.categoryService.deleteCategory(id, data);
  }
}
