import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService, DualAuthGuard],
})
export class StockInModule {}
