import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PublicStockController } from './public-stock.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [StockController, PublicStockController],
  providers: [StockService, PrismaService],
})
export class StockInModule {}
