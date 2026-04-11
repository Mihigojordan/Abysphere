import api from '../api/api';

export interface CreateProformaDto {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientId?: string;
    expiryDate?: Date;
    paymentTerms?: string;
    notes?: string;
    discountType?: 'PERCENTAGE' | 'FIXED';
    discountValue?: number;
    items: CreateProformaItemDto[];
    createdByAdminId?: string;
    createdByEmployeeId?: string;
}

export interface CreateProformaItemDto {
    stockId?: number;
    productName: string;
    productSku?: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discountPct?: number;
    taxPct?: number;
}

export interface UpdateProformaDto extends Partial<Omit<CreateProformaDto, 'items'>> {
    items?: CreateProformaItemDto[];
}

export interface ProformaInvoiceFilters {
    search?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

class ProformaInvoiceService {
    private readonly baseUrl = '/proforma-invoices';

    /**
     * Create a new Proforma Invoice
     */
    async create(data: CreateProformaDto) {
        const response = await api.post(this.baseUrl, data);
        return response.data;
    }

    /**
     * Get all Proforma Invoices with filters
     */
    async getAll(filters: ProformaInvoiceFilters = {}) {
        const response = await api.get(this.baseUrl, {
            params: filters
        });
        return response.data;
    }

    /**
     * Get Proforma Invoice by ID
     */
    async getOne(id: string) {
        const response = await api.get(`${this.baseUrl}/${id}`);
        return response.data;
    }

    /**
     * Update Proforma Invoice (DRAFT only)
     */
    async update(id: string, data: UpdateProformaDto) {
        const response = await api.put(`${this.baseUrl}/${id}`, data);
        return response.data;
    }

    /**
     * Submit PI (DRAFT -> SENT) — legacy, status-only change
     */
    async submit(id: string) {
        const response = await api.post(`${this.baseUrl}/${id}/submit`);
        return response.data;
    }

    /**
     * Send PI by email (DRAFT -> SENT) — checks/saves email, sends email via Brevo
     */
    async sendProforma(id: string, email?: string) {
        const response = await api.post(`${this.baseUrl}/${id}/send`, { email });
        return response.data;
    }

    /**
     * Mark as PAID & Trigger Stock Out
     */
    async markAsPaid(id: string, employeeId?: string) {
        const response = await api.post(`${this.baseUrl}/${id}/mark-as-paid`, {
            employeeId
        });
        return response.data;
    }

    /**
     * Cancel Proforma Invoice
     */
    async cancel(id: string, reason: string) {
        const response = await api.post(`${this.baseUrl}/${id}/cancel`, {
            reason
        });
        return response.data;
    }

    /**
     * Delete Proforma Invoice (DRAFT only)
     */
    async delete(id: string) {
        const response = await api.delete(`${this.baseUrl}/${id}`);
        return response.data;
    }
}

export default new ProformaInvoiceService();
