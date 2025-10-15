import { Module } from '@nestjs/common';
import { CageService } from './cage.service';
import { CageController } from './cage.controller';
@Module({
  providers: [CageService],
  controllers: [CageController],
})
export class CageModule {}
