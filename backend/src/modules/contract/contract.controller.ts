import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractGateway } from './contract.gateway';

@Controller('contracts')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contractGateway: ContractGateway,
  ) {}

  @Post()
  async create(@Body() data: any) {
    const contract = await this.contractService.create(data);
    this.contractGateway.emitContractCreated(contract); // notify real-time
    return contract;
  }

  @Get()
  async findAll() {
    return this.contractService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }
  @Get('employee/:employeeId')
  async findByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.contractService.findByEmployeeId(employeeId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const contract = await this.contractService.update(id, data);
    this.contractGateway.emitContractUpdated(contract); // notify real-time
    return contract;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const contract = await this.contractService.remove(id);
    this.contractGateway.emitContractDeleted(id); // notify real-time
    return contract;
  }
}
