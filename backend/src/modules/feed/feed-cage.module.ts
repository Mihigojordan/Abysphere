import { Module } from '@nestjs/common';
import { FeedCageService } from './feed-cage.service';
import { FeedCageController } from './feed-cage.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FeedCageController],
  providers: [FeedCageService, PrismaService],
})
export class FeedCageModule {}
