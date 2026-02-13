import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

export interface CreateGRNDto {
    purchaseOrderId: string;
    supplierId: string;
    receivedDate?: Date;
    receivedByAdminId?: string;
    receivedByEmployeeId?: string;
    notes?: string;
    items: CreateGRNItemDto[];
    costBreakdown?: CostBreakdownDto;
}

export interface CreateGRNItemDto {
    poItemId?: string;
    productName: string;
    productSku?: string;
    description?: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty?: number;
    unit: string;
    unitCost: number;
    batchNumber?: string;
    serialNumbers?: string[];
    manufacturingDate?: Date;
    expiryDate?: Date;
    locationId?: string;
    qualityStatus?: 'ACCEPTED' | 'REJECTED' | 'PARTIAL';
    qualityNotes?: string;
    damageNotes?: string;
}

export interface CostBreakdownDto {
    shippingCost?: number;
    customsDuties?: number;
    insurance?: number;
    handlingCharges?: number;
    otherFees?: number;
}

export interface GRNFilters {
    search?: string;
    status?: string;
    supplierId?: string;
    poId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

class GRNService {
    /**
     * Create a new GRN
     */
    async create(data: CreateGRNDto, token: string) {
        const response = await axios.post(`${BASE_URL}/grn`, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Get all GRNs with filters
     */
    async getAll(filters: GRNFilters = {}, token: string) {
        const response = await axios.get(`${BASE_URL}/grn`, {
            params: filters,
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Get GRN by ID
     */
    async getOne(id: string, token: string) {
        const response = await axios.get(`${BASE_URL}/grn/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }

    /**
     * Approve GRN and create stock entries
     */
    async approve(id: string, approvedById: string, isAdmin: boolean, token: string) {
        const response = await axios.post(
            `${BASE_URL}/grn/${id}/approve`,
            { approvedById, isAdmin },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }

    /**
     * Reject GRN
     */
    async reject(id: string, reason: string, token: string) {
        const response = await axios.post(
            `${BASE_URL}/grn/${id}/reject`,
            { reason },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }

    /**
     * Update inspection status
     */
    async updateInspection(
        id: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
        inspectionNotes?: string,
        qualityNotes?: string,
        token?: string
    ) {
        const response = await axios.put(
            `${BASE_URL}/grn/${id}/inspection`,
            { status, inspectionNotes, qualityNotes },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }
}

export default new GRNService();
