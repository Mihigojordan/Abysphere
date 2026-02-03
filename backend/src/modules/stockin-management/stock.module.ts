import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StockGateway } from './stock.gateway';
import { RequestModule } from './request/request.module';

@Module({
  controllers: [StockController],
  providers: [StockService, PrismaService,StockGateway],
  imports:[RequestModule],
  exports: [StockService],
})
export class StockModule {}
