import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AssetGateway } from './asset.gateway';

@Module({
  controllers: [AssetController],
  providers: [AssetService,AssetGateway],
})
export class AssetModule {}
