import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ExpenseManagementService {
    constructor(private prisma: PrismaService) { }

    private validateCustomType(data: any) {
        if (data.type === 'CUSTOM' && (!data.customTypeName || !data.customTypeName.trim())) {
            throw new BadRequestException('Custom type name is required when type is CUSTOM');
        }
    }

    async create(adminId: string, data: any) {
        this.validateCustomType(data);
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
        this.validateCustomType(data);
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
