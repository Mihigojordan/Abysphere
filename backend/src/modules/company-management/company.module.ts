import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/global/email/email.service';
import { CompanyGateway } from './company.gateway';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService,EmailService,CompanyGateway],
})
export class CompanyModule {}
