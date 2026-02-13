import { Module } from '@nestjs/common';
import { ExpenseManagementService } from './expense-management.service';
import { ExpenseManagementController } from './expense-management.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExpenseManagementController],
    providers: [ExpenseManagementService],
    exports: [ExpenseManagementService],
})
export class ExpenseManagementModule { }
