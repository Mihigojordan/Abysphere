import { Module } from '@nestjs/common';
import { FeedstockService } from './feedstock.service';
import { FeedstockController } from './feedstock.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [FeedstockController],
  providers: [FeedstockService, PrismaService],
})
export class FeedstockModule {}
