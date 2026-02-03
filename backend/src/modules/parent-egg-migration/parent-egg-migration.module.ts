import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ParentEggMigrationService } from './parent-egg-migration.service';
import { ParentEggMigrationController } from './parent-egg-migration.controller';

@Module({
  controllers: [ParentEggMigrationController],
  providers: [ParentEggMigrationService, PrismaService],
  exports: [ParentEggMigrationService],
})
export class ParentEggMigrationModule {}
