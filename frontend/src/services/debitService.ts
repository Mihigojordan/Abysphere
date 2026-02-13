// services/debitService.ts

import api from '../api/api';

export const DebitStatus = {
  PENDING: 'PENDING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;

export type DebitStatus = typeof DebitStatus[keyof typeof DebitStatus];

export interface Payment {
  amount: number;
  paidAt: string;
  note?: string;
}

export interface Debit {
  id: string;
  description?: string;
  totalAmount: number;
  stockOutId?: string;
  stockOut?: any;
  payments: Payment[];
  status: DebitStatus;
  adminId?: string;
  admin?: any;
  employeeId?: string;
  employee?: any;
  createdAt: string;
}

export interface CreateDebitData {
  description?: string;
  totalAmount: number;
  stockOutId?: string;
  adminId?: string;
  employeeId?: string;
}

export interface RecordPaymentData {
  amount: number;
  note?: string;
}

export interface UpdateDebitData {
  description?: string;
  totalAmount?: number;
}

export interface DebitStats {
  totalDebits: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  pendingCount: number;
  partiallyPaidCount: number;
  paidCount: number;
  cancelledCount: number;
}

class DebitService {
  private readonly baseUrl = '/debit';

  /**
   * Create a new debit
   */
  async createDebit(data: CreateDebitData): Promise<Debit> {
    if (!data.totalAmount || data.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    try {
      const response = await api.post(`${this.baseUrl}/create`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating debit:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create debit';
      throw new Error(message);
    }
  }

  /**
   * Get all debits
   */
  async getAllDebits(): Promise<Debit[]> {
    try {
      const response = await api.get(`${this.baseUrl}/all`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching debits:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch debits');
    }
  }

  /**
   * Get debit statistics
   */
  async getDebitStats(): Promise<DebitStats> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching debit stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch debit statistics');
    }
  }

  /**
   * Get single debit by ID
   */
  async getDebitById(id: string): Promise<Debit> {
    if (!id) throw new Error('Debit ID is required');

    try {
      const response = await api.get(`${this.baseUrl}/getone/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching debit:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch debit');
    }
  }

  /**
   * Get debit by StockOut ID
   */
  async getDebitByStockOutId(stockOutId: string): Promise<Debit | null> {
    if (!stockOutId) throw new Error('StockOut ID is required');

    try {
      const response = await api.get(`${this.baseUrl}/stockout/${stockOutId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching debit by stockout:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch debit');
    }
  }

  /**
   * Record a payment against a debit
   */
  async recordPayment(id: string, data: RecordPaymentData): Promise<Debit> {
    if (!id) throw new Error('Debit ID is required');
    if (!data.amount || data.amount <= 0) throw new Error('Payment amount must be greater than 0');

    try {
      const response = await api.post(`${this.baseUrl}/payment/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error recording payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to record payment');
    }
  }

  /**
   * Update a debit
   */
  async updateDebit(id: string, data: UpdateDebitData): Promise<Debit> {
    if (!id) throw new Error('Debit ID is required');

    try {
      const response = await api.put(`${this.baseUrl}/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating debit:', error);
      throw new Error(error.response?.data?.message || 'Failed to update debit');
    }
  }

  /**
   * Cancel a debit
   */
  async cancelDebit(id: string): Promise<Debit> {
    if (!id) throw new Error('Debit ID is required');

    try {
      const response = await api.put(`${this.baseUrl}/cancel/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling debit:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel debit');
    }
  }

  /**
   * Delete a debit
   */
  async deleteDebit(id: string): Promise<{ message: string }> {
    if (!id) throw new Error('Debit ID is required');

    try {
      const response = await api.delete(`${this.baseUrl}/delete/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting debit:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete debit');
    }
  }

  /**
   * Calculate remaining balance on a debit
   */
  calculateRemainingBalance(debit: Debit): number {
    if (!debit || !debit.totalAmount) return 0;
    const payments = debit.payments || [];
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    return debit.totalAmount - totalPaid;
  }

  /**
   * Calculate total paid on a debit
   */
  calculateTotalPaid(debit: Debit): number {
    if (!debit || !debit.payments) return 0;
    return debit.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  /**
   * Get status display info
   */
  getStatusDisplay(status: DebitStatus): { label: string; color: string } {
    switch (status) {
      case DebitStatus.PENDING:
        return { label: 'Pending', color: 'yellow' };
      case DebitStatus.PARTIALLY_PAID:
        return { label: 'Partially Paid', color: 'blue' };
      case DebitStatus.PAID:
        return { label: 'Paid', color: 'green' };
      case DebitStatus.CANCELLED:
        return { label: 'Cancelled', color: 'red' };
      default:
        return { label: 'Unknown', color: 'gray' };
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}

// Singleton instance
const debitService = new DebitService();
export default debitService;

// Also export the class if you want to extend or mock it
export { DebitService };
