import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  Put,
  Delete,
} from '@nestjs/common';
import { SiteService } from './site.service';
import {
  SiteFileFields,
  SiteUploadConfig,
} from 'src/common/utils/file-upload.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  // Create a site
  @Post()
  @UseInterceptors(FileFieldsInterceptor(SiteFileFields, SiteUploadConfig))
  async createSite(
    @Body() body: any,
    @UploadedFiles()
    files: {
      siteImg?: Express.Multer.File[];
    },
  ) {
    try {
      if (files?.siteImg?.[0]?.filename) {
        body.siteImg = `/uploads/site_images/${files.siteImg[0].filename}`;
      }
      return await this.siteService.createSite(body);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get all sites
  @Get()
  async getSites() {
    try {
      return await this.siteService.getSites();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Get single site
  @Get(':id')
  async getSite(@Param('id') id: string) {
    try {
      return await this.siteService.getSiteById(id);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Assign multiple employees to a site
  @Post(':id/assign')
  async assignEmployees(
    @Param('id') id: string,
    @Body('employeeIds') employeeIds: string[],
    @Body('managerId') managerId?: string,
    @Body('supervisorId') supervisorId?: string,
  ) {
    try {
      return await this.siteService.assignEmployees(
        id,
        employeeIds,
        managerId,
        supervisorId,
      );
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Update site
  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(SiteFileFields, SiteUploadConfig))
  async updateSite(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      siteImg?: Express.Multer.File[];
    },
  ) {
    try {
      if (files?.siteImg?.[0]?.filename) {
        body.siteImg = `/uploads/site_images/${files.siteImg[0].filename}`;
      }
      return await this.siteService.updateSite(id, body);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Delete site
  @Delete(':id')
  async deleteSite(@Param('id') id: string) {
    try {
      return await this.siteService.deleteSite(id);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
