// src/job/job.module.ts
import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobGateway } from './job.gateway';

@Module({
  controllers: [JobController],
  providers: [JobService, PrismaService,JobGateway],
  exports: [JobService],
})
export class JobModule {}
