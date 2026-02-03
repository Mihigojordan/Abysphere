import api from '../api/api'; // Adjust the import path as needed

// 🧩 Types
export interface SalesReturnItem {
  stockoutId: string;
  quantity: number;
}

export interface SalesReturnData {
  transactionId: string;
  reason?: string;
  createdAt?: Date | string;
  items: SalesReturnItem[];
  adminId?: string;
  employeeId?: string;
}

export interface SalesReturnFilters {
  transactionId?: string;
  reason?: string;
  createdAfter?: string;
  createdBefore?: string;
}

export interface SalesReturnResponse {
  id: string;
  transactionId: string;
  reason?: string;
  createdAt: string;
  items: SalesReturnItem[];
}

export interface BulkResult {
  message: string;
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    index: number;
    transactionId: string;
    result: any;
  }>;
  errors: Array<{
    index: number;
    transactionId: string;
    error: string;
  }>;
}

export interface SalesReturnStatistics {
  totalReturns: number;
  totalItems: number;
  totalQuantity: number;
  averageItemsPerReturn: number | string;
  mostCommonReason: string | null;
  reasonBreakdown?: Record<string, number>;
}

/**
 * 🧠 Enhanced SalesReturn Service for Frontend (TypeScript)
 */
class SalesReturnService {
  /**
   * Create a single sales return with items
   */
  async createSalesReturn(returnData: SalesReturnData): Promise<any> {
    try {
      this.validateSalesReturnData(returnData);

      const requestData = {
        transactionId: returnData.transactionId,
        reason: returnData.reason || undefined,
        createdAt: returnData.createdAt ? new Date(returnData.createdAt) : undefined,
        items: returnData.items.map(item => ({
          stockoutId: item.stockoutId,
          quantity: Number(item.quantity),
        })),
        adminId: returnData.adminId || undefined,
        employeeId: returnData.employeeId || undefined,
      };

      const response = await api.post('/sales-return/create', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating sales return:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create sales return');
    }
  }

  /**
   * Create multiple sales returns in bulk (sequential processing)
   */
  async createBulkSalesReturns(returnsArray: SalesReturnData[]): Promise<BulkResult> {
    try {
      if (!Array.isArray(returnsArray) || returnsArray.length === 0) {
        throw new Error('At least one return is required');
      }

      const results: BulkResult['results'] = [];
      const errors: BulkResult['errors'] = [];

      for (let i = 0; i < returnsArray.length; i++) {
        try {
          const result = await this.createSalesReturn(returnsArray[i]);
          results.push({ index: i, transactionId: returnsArray[i].transactionId, result });
        } catch (error: any) {
          errors.push({
            index: i,
            transactionId: returnsArray[i].transactionId,
            error: error.message,
          });
        }
      }

      return {
        message: 'Bulk sales return processing completed',
        totalProcessed: returnsArray.length,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      };
    } catch (error: any) {
      console.error('Error in bulk sales return creation:', error);
      throw new Error(error.message || 'Failed to process bulk sales returns');
    }
  }

  /**
   * Get all sales return entries
   */
  async getAllSalesReturns(filters: SalesReturnFilters = {}): Promise<any> {
    try {
      let url = '/sales-return';
      const queryParams = new URLSearchParams();

      if (filters.transactionId) queryParams.append('transactionId', filters.transactionId);
      if (filters.reason) queryParams.append('reason', filters.reason);
      if (filters.createdAfter) queryParams.append('createdAfter', filters.createdAfter);
      if (filters.createdBefore) queryParams.append('createdBefore', filters.createdBefore);

      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching all sales returns:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sales returns');
    }
  }

  /**
   * Get a single sales return entry by ID
   */
  async getSalesReturnById(id: string): Promise<SalesReturnResponse> {
    try {
      if (!id) throw new Error('Sales return ID is required');
      const response = await api.get(`/sales-return/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sales return by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch sales return');
    }
  }

  /**
   * Get sales returns by transaction ID
   */
  async getSalesReturnsByTransactionId(transactionId: string): Promise<any> {
    try {
      if (!transactionId) throw new Error('Transaction ID is required');
      return await this.getAllSalesReturns({ transactionId });
    } catch (error: any) {
      console.error('Error fetching sales returns by transaction ID:', error);
      throw new Error(error.message || 'Failed to fetch sales returns by transaction ID');
    }
  }

  /**
   * Get sales returns within a date range
   */
  async getSalesReturnsByDateRange(startDate: Date | string, endDate: Date | string): Promise<any> {
    try {
      if (!startDate || !endDate) throw new Error('Both start date and end date are required');

      const filters: SalesReturnFilters = {
        createdAfter: new Date(startDate).toISOString(),
        createdBefore: new Date(endDate).toISOString(),
      };

      return await this.getAllSalesReturns(filters);
    } catch (error: any) {
      console.error('Error fetching sales returns by date range:', error);
      throw new Error(error.message || 'Failed to fetch sales returns by date range');
    }
  }

  /**
   * Validate sales return data before sending
   */
  validateSalesReturnData(returnData: SalesReturnData): boolean {
    const errors: string[] = [];

    if (!returnData.transactionId) errors.push('Transaction ID is required');

    if (!returnData.items || !Array.isArray(returnData.items))
      errors.push('Items array is required');
    else if (returnData.items.length === 0)
      errors.push('At least one item must be provided');
    else {
      returnData.items.forEach((item, index) => {
        if (!item.stockoutId)
          errors.push(`Stockout ID is required for item at index ${index}`);
        if (!item.quantity || isNaN(Number(item.quantity)) || Number(item.quantity) <= 0)
          errors.push(`Valid quantity is required for item at index ${index}`);
      });
    }

    if (returnData.createdAt && isNaN(new Date(returnData.createdAt).getTime()))
      errors.push('Invalid createdAt date format');

    if (errors.length > 0) throw new Error(errors.join(', '));

    return true;
  }

  /**
   * Format sales return data for display
   */
  formatSalesReturnForDisplay(salesReturn: any): any {
    if (!salesReturn) return null;

    return {
      id: salesReturn.id,
      transactionId: salesReturn.transactionId,
      reason: salesReturn.reason || 'No reason provided',
      createdAt: new Date(salesReturn.createdAt).toLocaleString(),
      itemCount: salesReturn.items?.length || 0,
      totalQuantity: salesReturn.items
        ? salesReturn.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        : 0,
      items: salesReturn.items?.map((item: any) => ({
        id: item.id,
        stockoutId: item.stockoutId,
        quantity: item.quantity,
        stockoutInfo: item.stockout
          ? {
              id: item.stockout.id,
              quantity: item.stockout.quantity,
              stockinInfo: item.stockout.stockin
                ? {
                    id: item.stockout.stockin.id,
                    quantity: item.stockout.stockin.quantity,
                  }
                : null,
            }
          : null,
      })),
    };
  }

  /**
   * Calculate return statistics
   */
  calculateReturnStatistics(salesReturns: any[]): SalesReturnStatistics {
    if (!Array.isArray(salesReturns) || salesReturns.length === 0) {
      return {
        totalReturns: 0,
        totalItems: 0,
        totalQuantity: 0,
        averageItemsPerReturn: 0,
        mostCommonReason: null,
      };
    }

    const totalReturns = salesReturns.length;
    let totalItems = 0;
    let totalQuantity = 0;
    const reasonCounts: Record<string, number> = {};

    salesReturns.forEach(returnItem => {
      if (returnItem.items) {
        totalItems += returnItem.items.length;
        totalQuantity += returnItem.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
      }

      const reason = returnItem.reason || 'No reason provided';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const mostCommonReason =
      Object.keys(reasonCounts).reduce((a, b) =>
        reasonCounts[a] > reasonCounts[b] ? a : b
      ) || null;

    return {
      totalReturns,
      totalItems,
      totalQuantity,
      averageItemsPerReturn:
        totalReturns > 0 ? (totalItems / totalReturns).toFixed(2) : 0,
      mostCommonReason,
      reasonBreakdown: reasonCounts,
    };
  }
}

// Export singleton instance + class
const salesReturnService = new SalesReturnService();
export default salesReturnService;
export { SalesReturnService };
