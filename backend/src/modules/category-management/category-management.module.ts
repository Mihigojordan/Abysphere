import { Module } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';
import { CategoryManagementController } from './category-management.controller';
import { PublicCategoryController } from './public-category.controller';


@Module({
  providers: [CategoryManagementService],
  controllers: [CategoryManagementController, PublicCategoryController]
})
export class CategoryManagementModule {}
