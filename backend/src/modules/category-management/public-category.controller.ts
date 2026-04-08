import { Controller, Get } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';

@Controller('public-category')
export class PublicCategoryController {
  constructor(private readonly categoryService: CategoryManagementService) {}

  // Public: all categories (no auth required)
  @Get('all')
  async getAllPublic() {
    return this.categoryService.findAllPublic();
  }
}
