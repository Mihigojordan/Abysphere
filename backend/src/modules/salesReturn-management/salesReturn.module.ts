import { Module } from '@nestjs/common';
import { SalesReturnService } from './salesReturn.service';
import { SalesReturnController } from './salesReturn.controller';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
  controllers: [SalesReturnController],
  providers: [SalesReturnService, DualAuthGuard],
})
export class SalesReturnModule {}