// src/modules/SuperAdmin-management/systemfeatures-management/system-features.module.ts
import { Module } from '@nestjs/common';
import { SystemFeaturesService } from './system-features.service';
import { SystemFeaturesController } from './system-features.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SystemFeaturesService, PrismaService],
  controllers: [SystemFeaturesController],
})
export class SystemFeaturesModule {}