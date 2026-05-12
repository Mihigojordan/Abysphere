import { Module } from '@nestjs/common';
import { ExpenseManagementService } from './expense-management.service';
import { ExpenseManagementController } from './expense-management.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { DualAuthGuard } from 'src/guards/dual-auth.guard';

@Module({
    imports: [PrismaModule],
    controllers: [ExpenseManagementController],
    providers: [ExpenseManagementService, DualAuthGuard],
    exports: [ExpenseManagementService],
})
export class ExpenseManagementModule { }
