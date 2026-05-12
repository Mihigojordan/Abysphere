import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientGateway } from './client.gateway';
import { EmailService } from 'src/global/email/email.service';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
  controllers: [ClientController],
  providers: [ClientService, PrismaService, ClientGateway, EmailService, DualAuthGuard],
  exports: [ClientService],
})
export class ClientModule {}
