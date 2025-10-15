import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AssetService } from './asset.service';
import { AssetGateway } from './asset.gateway';
import { AssetFileFields, AssetUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('assets')
export class AssetController {
  constructor(
    private readonly assetService: AssetService,
    private readonly assetGateway: AssetGateway,
  ) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor(AssetFileFields, AssetUploadConfig))
  async create(
    @UploadedFiles()
    files: {
      assetImg?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    try {
      if (files?.assetImg?.[0]?.filename) {
        body.assetImg = `/uploads/asset_images/${files.assetImg[0].filename}`;
      }
      const asset = await this.assetService.create(body);
      this.assetGateway.emitAssetCreated(asset);
      return asset;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.assetService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.assetService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(AssetFileFields, AssetUploadConfig))
  async update(
    @UploadedFiles()
    files: {
      assetImg?: Express.Multer.File[];
    },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    try {
      if (files?.assetImg?.[0]?.filename) {
        body.assetImg = `/uploads/asset_images/${files.assetImg[0].filename}`;
      }
      const asset = await this.assetService.update(id, body);
      this.assetGateway.emitAssetUpdated(asset);
      return asset;
    } catch (error) {
      throw error;
    }
  }

  @Put('/status/:id')
  async updateStatus(@Param('id') id: string, @Body() body: any) {
    try {
      const asset = await this.assetService.updateStatus(id, body.status);
      this.assetGateway.emitAssetStatusChanged(asset.id, asset.status);
      return asset;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const asset = await this.assetService.remove(id);
      this.assetGateway.emitAssetDeleted(id);
      return asset;
    } catch (error) {
      throw error;
    }
  }
}
