import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export interface CreatePODto {
    supplierId: string;
    orderDate?: Date;
    expectedDeliveryDate?: Date;
    paymentTerms?: string;
    deliveryTerms?: string;
    notes?: string;
    internalNotes?: string;
    items: CreatePOItemDto[];
    createdByAdminId?: string;
    createdByEmployeeId?: string;
}

export interface CreatePOItemDto {
    productName: string;
    productSku?: string;
    description?: string;
    orderedQty: number;
    unit: string;
    unitPrice: number;
    discountPct?: number;
    taxPct?: number;
}

export interface UpdatePODto extends Partial<Omit<CreatePODto, 'items'>> {
    items?: CreatePOItemDto[];
}

export interface PurchaseOrderFilters {
    search?: string;
    status?: string;
    supplierId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

class PurchaseOrderService {
    /**
     * Create a new Purchase Order
     */
    async create(data: CreatePODto, token: string) {
        const response = await axios.post(`${BASE_URL}/purchase-orders`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Get all Purchase Orders with filters
     */
    async getAll(filters: PurchaseOrderFilters = {}, token: string) {
        const response = await axios.get(`${BASE_URL}/purchase-orders`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Get Purchase Order by ID
     */
    async getOne(id: string, token: string) {
        const response = await axios.get(`${BASE_URL}/purchase-orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Update Purchase Order (DRAFT only)
     */
    async update(id: string, data: UpdatePODto, token: string) {
        const response = await axios.put(`${BASE_URL}/purchase-orders/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Submit PO for approval
     */
    async submit(id: string, token: string) {
        const response = await axios.post(
            `${BASE_URL}/purchase-orders/${id}/submit`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }

    /**
     * Approve Purchase Order
     */
    async approve(id: string, approvedById: string, isAdmin: boolean, token: string) {
        const response = await axios.post(
            `${BASE_URL}/purchase-orders/${id}/approve`,
            { approvedById, isAdmin },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }

    /**
     * Cancel Purchase Order
     */
    async cancel(id: string, reason: string, token: string) {
        const response = await axios.post(
            `${BASE_URL}/purchase-orders/${id}/cancel`,
            { reason },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }

    /**
     * Delete Purchase Order (DRAFT only)
     */
    async delete(id: string, token: string) {
        const response = await axios.delete(`${BASE_URL}/purchase-orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
}

export default new PurchaseOrderService();
