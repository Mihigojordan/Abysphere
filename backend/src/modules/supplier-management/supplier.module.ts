import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
  imports: [],
  controllers: [SupplierController],
  providers: [SupplierService, PrismaService, DualAuthGuard],
  exports: [SupplierService],
})
export class SupplierManagementModule { }
