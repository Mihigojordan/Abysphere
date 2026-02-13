import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';

@Module({
  imports: [],
  controllers: [SupplierController],
  providers: [SupplierService, PrismaService, AdminJwtAuthGuard],
  exports: [SupplierService],
})
export class SupplierManagementModule { }
