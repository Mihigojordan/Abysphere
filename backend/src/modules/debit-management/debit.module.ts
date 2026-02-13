import { Module } from '@nestjs/common';
import { DebitService } from './debit.service';
import { DebitController } from './debit.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [DebitController],
  providers: [DebitService, PrismaService],
  exports: [DebitService],
})
export class DebitModule {}
