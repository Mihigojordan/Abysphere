import { Module } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApplicantGateway } from './applicant.gateway';

@Module({
  controllers: [ApplicantController],
  providers: [ApplicantService, PrismaService,ApplicantGateway],
  exports: [ApplicantService],
})
export class ApplicantModule {}
