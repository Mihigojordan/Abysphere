import { Module } from '@nestjs/common';
import { SupplierManagementService } from './supplier.service';
import { SupplierManagementController } from './supplier.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';

@Module({
  imports: [],
  controllers: [SupplierManagementController],
  providers: [SupplierManagementService, PrismaService, AdminJwtAuthGuard],
  exports: [SupplierManagementService],
})
export class SupplierManagementModule {}
