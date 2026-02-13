import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ExpenseManagementService {
    constructor(private prisma: PrismaService) { }

    async create(adminId: string, data: any) {
        return this.prisma.expense.create({
            data: {
                ...data,
                adminId,
                date: new Date(data.date),
            },
        });
    }

    async findAll(adminId: string) {
        return this.prisma.expense.findMany({
            where: { adminId },
            orderBy: { date: 'desc' },
        });
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
