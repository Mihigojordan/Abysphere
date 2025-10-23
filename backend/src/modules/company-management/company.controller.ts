import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyGateway } from './company.gateway';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly companyGateway: CompanyGateway,
  ) {}

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
}
