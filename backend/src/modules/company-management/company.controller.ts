import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyGateway } from './company.gateway';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminFileFields, AdminUploadConfig } from 'src/common/utils/file-upload.utils';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyGateway: CompanyGateway,
  ) {}

  // ============================
  // 🔹 COMPANY CRUD OPERATIONS
  // ============================

  @Post()
    @UseInterceptors(
      FileFieldsInterceptor(AdminFileFields, AdminUploadConfig),
    )
  async create(@Body() body: any, @UploadedFiles() files: { profileImg?: Express.Multer.File[] },) {

     function parseBoolean(value: string | boolean | undefined): boolean | undefined {
      if (typeof value === 'string') return JSON.parse(value);
      return value;
    }
    if (files?.profileImg?.[0]?.filename) {
      body['profileImage'] = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }
    if (body['is2FA']) {
      body['is2FA'] = parseBoolean(body['is2FA'])
    }
    const company = await this.companyService.create(body);
    this.companyGateway.emitCompanyCreated(company);
    return company;
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
    @UseInterceptors(
    FileFieldsInterceptor(AdminFileFields, AdminUploadConfig),
  )
  async update(@Param('id') id: string, @Body() body: any, @UploadedFiles() files: { profileImg?: Express.Multer.File[] },) {
     function parseBoolean(value: string | boolean | undefined): boolean | undefined {
      if (typeof value === 'string') return JSON.parse(value);
      return value;
    }
    if (files?.profileImg?.[0]?.filename) {
      body['profileImage'] = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }
    if (body['is2FA']) {
      body['is2FA'] = parseBoolean(body['is2FA'])
    }
    
    const company = await this.companyService.update(id, body);
    this.companyGateway.emitCompanyUpdated(company);
    return company;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.companyService.remove(id);
    this.companyGateway.emitCompanyDeleted(id);
    return deleted;
  }

   @Post(':adminId/set-message')
  async setAdminMessage(
    @Param('adminId') adminId: string,
    @Body('message') message: string,
    @Body('expiry') expiry?: string,
    @Body('textColor') textColor?: string,
    @Body('bgColor') bgColor?: string,
  ) {
    const expiryDate = expiry ? new Date(expiry) : undefined;

    const result = await this.companyService.setAdminMessage(
      adminId,
      message,
      expiryDate,
      textColor,
      bgColor,
    );

    // 🔔 Notify connected clients in real-time
    this.companyGateway.server.emit('companyMessageUpdated', {
      adminId,
      message: result.data.message,
      expiry: result.data.messageExpiry,
      textColor: result.data.messageTextColor,
      bgColor: result.data.messageBgColor,
    });

    return result;
  }
   @Post(':adminId/clear-message')
  async clearAdminMessages(
    @Param('adminId') adminId: string,

  ) {


    const result = await this.companyService.clearAdminMessages(
      adminId,
    );

    // 🔔 Notify connected clients in real-time
    this.companyGateway.server.emit('clearedCompanyMessages', {
      adminId,
    });

    return result;
  }

  
  // ========================================
  // 🔹 ADMIN ↔ FEATURE RELATION MANAGEMENT
  // ========================================

  /**
   * ✅ Assign one or more features to an admin
   * POST /company/:adminId/assign-features
   */
  @Post(':adminId/assign-features')
  async assignFeatures(
    @Param('adminId') adminId: string,
    @Body('featureIds') featureIds: string[],
  ) {
    const result = await this.companyService.assignFeaturesToCompany(adminId, featureIds);

    // 🔔 Notify clients in real-time
    this.companyGateway.server.emit('featureAssigned', {
      adminId,
      assignedFeatures: result?.features,
      admin:result
    });

    return result;
  }

  /**
   * 🚫 Remove one or more features from an admin
   * POST /company/:adminId/remove-features
   */
  @Post(':adminId/remove-features')
  async removeFeatures(
    @Param('adminId') adminId: string,
    @Body('featureIds') featureIds: string[],
  ) {
    const result = await this.companyService.removeFeaturesFromCompany(adminId, featureIds);

    // 🔔 Notify clients in real-time
    this.companyGateway.server.emit('featureRemoved', {
      adminId,
      remainingFeatures: result?.features,
    });

    return result;
  }

  /**
   * 🔍 Get all features assigned to an admin
   * GET /company/:adminId/features
   */
  @Get(':adminId/features')
  async getCompanyFeatures(@Param('adminId') adminId: string) {
    return this.companyService.getCompanyFeatures(adminId);
  }

  /**
   * 👑 Get all admins that have a specific feature
   * GET /company/feature/:featureId/admins
   */
  @Get('feature/:featureId/admins')
  async getFeatureCompanys(@Param('featureId') featureId: string) {
    return this.companyService.getFeatureCompanys(featureId);
  }
}
