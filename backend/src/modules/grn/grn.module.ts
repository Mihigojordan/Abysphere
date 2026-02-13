import { Module } from '@nestjs/common';
import { GRNController } from './grn.controller';
import { GRNService } from './grn.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [GRNController],
    providers: [GRNService, PrismaService],
    exports: [GRNService],
})
export class GRNModule { }
