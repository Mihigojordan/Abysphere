import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ExpenseManagementService {
    constructor(private prisma: PrismaService) { }

    async create(adminId: string, data: any, employeeId?: string | null) {
        return this.prisma.expense.create({
            data: {
                ...data,
                adminId,
                employeeId: employeeId || null,
                date: new Date(data.date),
            },
        });
    }

    async findAll(adminId: string, employeeId?: string | null) {
        let where: any = { adminId };
        if (employeeId) {
            const canViewAll = await this.canEmployeeViewAll(employeeId, adminId, 'EXPENSE_MANAGEMENT');
            if (!canViewAll) where = { adminId, employeeId };
        }
        return this.prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
    }

    private async canEmployeeViewAll(employeeId: string, adminId: string, featureName: string): Promise<boolean> {
        const assignments = await this.prisma.employeePermissionAssignment.findMany({
            where: { employeeId, adminId },
            include: { template: true },
        });
        return assignments.some(a => a.template.featureName === featureName && a.template.canViewAll);
    }

    async findOne(adminId: string, id: string) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, adminId },
        });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async update(adminId: string, id: string, data: any) {
        await this.findOne(adminId, id);
        return this.prisma.expense.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
            },
        });
    }

    async remove(adminId: string, id: string) {
        await this.findOne(adminId, id);
        return this.prisma.expense.delete({
            where: { id },
        });
    }
}
