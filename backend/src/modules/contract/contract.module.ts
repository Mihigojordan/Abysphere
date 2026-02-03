import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractGateway } from './contract.gateway';

@Module({
  controllers: [ContractController],
  providers: [ContractService, ContractGateway],
})
export class ContractModule {}
