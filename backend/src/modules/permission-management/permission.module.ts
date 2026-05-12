import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PermissionGateway } from './permission.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PermissionService, PermissionGateway, PrismaService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}
