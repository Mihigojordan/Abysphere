import { Module } from '@nestjs/common';
import { AssetRequestService } from './request.service';
import { AssetRequestController } from './request.controller';
import { AssetRequestGateway } from './request.gateway';

@Module({
  controllers: [AssetRequestController],
  providers: [AssetRequestService, AssetRequestGateway],
})
export class AssetRequestModule {}
