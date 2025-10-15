import { Module } from '@nestjs/common';
import { EggToPondMigrationService } from './egg-to-pond-migration.service';
import { EggToPondMigrationController } from './egg-to-pond-migration.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [EggToPondMigrationController],
  providers: [EggToPondMigrationService, PrismaService],
  exports: [EggToPondMigrationService],
})
export class EggToPondMigrationModule {}
