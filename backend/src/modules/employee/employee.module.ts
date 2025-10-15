// employee.module.ts
import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeAuthModule } from './auth/employee-auth.module';


@Module({
  controllers: [EmployeeController],
  imports:[
    EmployeeAuthModule,
  ],
  providers: [EmployeeService, PrismaService,],
  exports: [EmployeeService],
})
export class EmployeeModule {}

