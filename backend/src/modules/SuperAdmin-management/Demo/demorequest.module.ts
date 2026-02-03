import { Module } from '@nestjs/common';
import { DemoRequestService } from './demorequest.service';
import { DemoRequestController } from './demorequest.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [DemoRequestController],
  providers: [DemoRequestService, PrismaService],
})
export class DemoRequestModule {}
