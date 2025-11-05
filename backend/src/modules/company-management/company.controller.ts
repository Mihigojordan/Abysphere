import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyGateway } from './company.gateway';

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
  async create(@Body() body: any) {
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
  async update(@Param('id') id: string, @Body() body: any) {
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
  ) {
    const expiryDate = expiry ? new Date(expiry) : undefined;

    const result = await this.companyService.setAdminMessage(
      adminId,
      message,
      expiryDate,
    );

    // 🔔 Notify connected clients in real-time
    this.companyGateway.server.emit('companyMessageUpdated', {
      adminId,
      message: result.data.message,
      expiry: result.data.messageExpiry,
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
      assignedFeatures: result.features,
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
      remainingFeatures: result.features,
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
