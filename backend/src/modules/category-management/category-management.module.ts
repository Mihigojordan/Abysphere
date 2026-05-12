import { Module } from '@nestjs/common';
import { CategoryManagementService } from './category-management.service';
import { CategoryManagementController } from './category-management.controller';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
  providers: [CategoryManagementService, DualAuthGuard],
  controllers: [CategoryManagementController]
})
export class CategoryManagementModule {}
