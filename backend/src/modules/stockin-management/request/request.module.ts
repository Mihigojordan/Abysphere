// src/request/request.module.ts
import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RequestGateway } from './request.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [RequestController],
  providers: [RequestService,RequestGateway],
  exports: [RequestService],
})
export class RequestModule {}