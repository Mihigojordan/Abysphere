import api from '../api/api';
import { AxiosError, type AxiosResponse } from 'axios';

export type ExpenseType = 'DEBIT' | 'CREDIT';

export interface Expense {
    id?: string;
    title: string;
    description?: string;
    amount: number;
    category?: string;
    date: string | Date;
    paymentMethod?: string;
    type: ExpenseType;
    adminId?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

class ExpenseService {
    /**
     * Create a new expense
     */
    async createExpense(expenseData: Partial<Expense>): Promise<Expense> {
        try {
            const response: AxiosResponse<Expense> = await api.post('/expense-management', expenseData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to create expense');
        }
    }

    /**
     * Get all expenses for the current admin
     */
    async getAllExpenses(): Promise<Expense[]> {
        try {
            const response: AxiosResponse<Expense[]> = await api.get('/expense-management');
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch expenses');
        }
    }

    /**
     * Get an expense by ID
     */
    async getExpenseById(id: string): Promise<Expense> {
        try {
            const response: AxiosResponse<Expense> = await api.get(`/expense-management/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to fetch expense details');
        }
    }

    /**
     * Update an existing expense
     */
    async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
        try {
            const response: AxiosResponse<Expense> = await api.put(`/expense-management/${id}`, expenseData);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to update expense');
        }
    }

    /**
     * Delete an expense
     */
    async deleteExpense(id: string): Promise<{ message: string }> {
        try {
            const response: AxiosResponse<{ message: string }> = await api.delete(`/expense-management/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, 'Failed to delete expense');
        }
    }

    /**
     * Validate expense data before submission
     */
    validateExpenseData(expenseData: Partial<Expense>): ValidationResult {
        const errors: string[] = [];

        if (!expenseData.title || expenseData.title.trim() === '') {
            errors.push('Title is required');
        }

        if (expenseData.amount === undefined || expenseData.amount < 0) {
            errors.push('Amount must be a positive number');
        }

        if (!expenseData.date) {
            errors.push('Date is required');
        }

        if (!expenseData.type) {
            errors.push('Expense type (DEBIT/CREDIT) is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Centralized error handling
     */
    private handleError(error: unknown, defaultMessage: string): never {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || error.message || defaultMessage;
            throw new Error(message);
        }
        throw new Error(defaultMessage);
    }
}

const expenseService = new ExpenseService();
export default expenseService;
