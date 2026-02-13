import { Module } from '@nestjs/common';
import { ExpenseManagementService } from './expense-management.service';
import { ExpenseManagementController } from './expense-management.controller';
<<<<<<< HEAD
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExpenseManagementController],
    providers: [ExpenseManagementService],
=======
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [ExpenseManagementController],
    providers: [ExpenseManagementService, PrismaService],
>>>>>>> 5d576cb (hello)
    exports: [ExpenseManagementService],
})
export class ExpenseManagementModule { }
