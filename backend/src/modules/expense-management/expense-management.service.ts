<<<<<<< HEAD
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
=======
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ExpenseType } from '../../../generated/prisma';

@Injectable()
export class ExpenseManagementService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async createExpense(data: {
        title: string;
        description?: string;
        amount: number;
        category?: string;
        date?: Date;
        paymentMethod?: string;
        type?: ExpenseType;
        adminId: string;
    }) {
        try {
            const { title, amount, adminId } = data;

            if (!title || !amount || !adminId) {
                throw new BadRequestException('Title, amount, and adminId are required');
            }

            const createdExpense = await this.prismaService.expense.create({
                data: {
                    title: data.title,
                    description: data.description,
                    amount: data.amount,
                    category: data.category,
                    date: data.date ? new Date(data.date) : new Date(),
                    paymentMethod: data.paymentMethod,
                    type: data.type || 'DEBIT',
                    adminId: data.adminId,
                },
            });

            return {
                message: 'Expense created successfully',
                expense: createdExpense,
            };
        } catch (error) {
            console.error('Error creating expense:', error);
            throw new Error(error.message);
        }
    }

    async getAllExpenses(adminId: string) {
        try {
            const expenses = await this.prismaService.expense.findMany({
                where: { adminId },
                orderBy: { date: 'desc' },
            });
            return expenses;
        } catch (error) {
            console.error('Error getting expenses:', error);
            throw new Error(error.message);
        }
    }

    async getExpenseById(id: string, adminId: string) {
        try {
            const expense = await this.prismaService.expense.findUnique({
                where: { id, adminId },
            });

            if (!expense) throw new BadRequestException('Expense not found');

            return expense;
        } catch (error) {
            console.error('Error getting expense:', error);
            throw new Error(error.message);
        }
    }

    async updateExpense(
        id: string,
        adminId: string,
        data: {
            title?: string;
            description?: string;
            amount?: number;
            category?: string;
            date?: Date;
            paymentMethod?: string;
            type?: ExpenseType;
        },
    ) {
        try {
            const existing = await this.prismaService.expense.findUnique({
                where: { id, adminId },
            });

            if (!existing) throw new BadRequestException('Expense not found');

            const updated = await this.prismaService.expense.update({
                where: { id },
                data: {
                    title: data.title ?? existing.title,
                    description: data.description ?? existing.description,
                    amount: data.amount ?? existing.amount,
                    category: data.category ?? existing.category,
                    date: data.date ? new Date(data.date) : existing.date,
                    paymentMethod: data.paymentMethod ?? existing.paymentMethod,
                    type: data.type ?? existing.type,
                },
            });

            return {
                message: 'Expense updated successfully',
                expense: updated,
            };
        } catch (error) {
            console.error('Error updating expense:', error);
            throw new Error(error.message);
        }
    }

    async deleteExpense(id: string, adminId: string) {
        try {
            const existing = await this.prismaService.expense.findUnique({
                where: { id, adminId },
            });

            if (!existing) throw new BadRequestException('Expense not found');

            const deleted = await this.prismaService.expense.delete({
                where: { id },
            });

            return {
                message: 'Expense deleted successfully',
                expense: deleted,
            };
        } catch (error) {
            console.error('Error deleting expense:', error);
            throw new Error(error.message);
        }
>>>>>>> 5d576cb (hello)
    }
}
