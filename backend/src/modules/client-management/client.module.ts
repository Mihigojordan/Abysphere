import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientGateway } from './client.gateway';

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService, ClientGateway],
  exports: [ClientService],
})
export class ClientModule {}
