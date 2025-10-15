import api from '../api/api'; // axios instance
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// Request statuses (aligned with backend Prisma schema)
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'CLOSED';

// Requested item statuses (aligned with backend Prisma schema)
export type RequestedItemStatus = 'PENDING' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'PENDING_PROCUREMENT';

// Procurement statuses (aligned with backend Prisma schema)
export type ProcurementStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'ORDERED' | 'PARTIALLY_ORDERED' | 'COMPLETED';

// Asset Request Item interface
export interface AssetRequestItemData {
  assetId: string;
  quantity: number;
}

export interface AssetRequestItem extends AssetRequestItemData {
  id: string;
  requestId: string;
  quantityIssued?: number;
  status?: RequestedItemStatus;
  procurementStatus?: ProcurementStatus;
  createdAt?: string;
  updatedAt?: string;
  asset?: {
    id: string;
    name: string;
    quantity?: string;
    [key: string]: any;
  };
  request?: {
    id: string;
    employeeId: string;
    status: RequestStatus;
    [key: string]: any;
  };
}

// DTO for creating/updating asset request
export interface AssetRequestData {
  employeeId: string;
  description?: string | null;
  items: AssetRequestItemData[];
}

// Asset Request entity with ID and relations
export interface AssetRequest {
  id: string;
  employeeId: string;
  status: RequestStatus;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    [key: string]: any;
  };
  items?: AssetRequestItem[];
}

// Update data interface
export interface AssetRequestUpdateData {
  description?: string;
  items?: AssetRequestItemData[];
}

// Issued items for approve and issue
export interface IssuedItem {
  itemId: string;
  issuedQuantity: number;
}

// Procurement update data
export interface ProcurementUpdateData {
  assetId: string;
  orderedQuantity: number;
}

// Procurement update response
export interface ProcurementUpdateResponse {
  message: string;
  asset: {
    id: string;
    name: string;
    quantity: string;
    [key: string]: any;
  };
  orderedQuantity: number;
  totalNeeded: number;
  newQuantity: number;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Delete response
export interface DeleteResponse {
  message: string;
  id: string;
}

/**
 * Asset Request Service
 */
class AssetRequestService {
  private api: AxiosInstance = api;

  /**
   * Create a new asset request
   */
  async createRequest(requestData: AssetRequestData): Promise<AssetRequest> {
    try {
      const response: AxiosResponse<AssetRequest> = await this.api.post('/asset-requests', requestData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to create asset request');
    }
  }

  /**
   * Get all asset requests
   */
  async getAllRequests(): Promise<AssetRequest[]> {
    try {
      const response: AxiosResponse<AssetRequest[]> = await this.api.get('/asset-requests');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching asset requests:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch asset requests');
    }
  }

  /**
   * Get a single asset request by ID
   */
  async getRequestById(id: string): Promise<AssetRequest | null> {
    try {
      const response: AxiosResponse<AssetRequest> = await this.api.get(`/asset-requests/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch asset request');
    }
  }

  /**
   * Update an asset request (only PENDING requests can be updated)
   */
  async updateRequest(id: string, updateData: AssetRequestUpdateData): Promise<AssetRequest> {
    try {
      const response: AxiosResponse<AssetRequest> = await this.api.patch(`/asset-requests/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to update asset request');
    }
  }

  /**
   * Delete an asset request (only PENDING requests can be deleted)
   */
  async deleteRequest(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/asset-requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete asset request');
    }
  }

  /**
   * Approve and issue an asset request (only PENDING requests)
   */
  async approveAndIssueRequest(id: string, issuedItems: IssuedItem[]): Promise<AssetRequest> {
    try {
      const response: AxiosResponse<AssetRequest> = await this.api.patch(`/asset-requests/${id}/approve`, { issuedItems });
      return response.data;
    } catch (error: any) {
      console.error('Error approving and issuing asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to approve and issue asset request');
    }
  }

  /**
   * Reject an asset request
   */
  async rejectRequest(id: string): Promise<AssetRequest> {
    try {
      const response: AxiosResponse<AssetRequest> = await this.api.patch(`/asset-requests/${id}/reject`);
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting asset request:', error);
      throw new Error(error.response?.data?.error || 'Failed to reject asset request');
    }
  }

  /**
   * Get all items that need procurement
   */
  async getItemsForProcurement(): Promise<AssetRequestItem[]> {
    try {
      const response: AxiosResponse<AssetRequestItem[]> = await this.api.get('/asset-requests/procurement');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching items for procurement:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch items for procurement');
    }
  }

  /**
   * Get procurement items by ID
   */
  async getItemForProcurementById(id: string): Promise<AssetRequestItem[]> {
    try {
      const response: AxiosResponse<AssetRequestItem[]> = await this.api.get(`/asset-requests/procurement/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching procurement item by ID:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch procurement item');
    }
  }

  /**
   * Update procurement status for an asset
   */
  async updateProcurementStatus(assetId: string, orderedQuantity: number): Promise<ProcurementUpdateResponse> {
    try {
      const response: AxiosResponse<ProcurementUpdateResponse> = await this.api.patch('/asset-requests/procurement/update', {
        assetId,
        orderedQuantity,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating procurement status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update procurement status');
    }
  }

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: RequestStatus): Promise<AssetRequest[]> {
    try {
      const allRequests = await this.getAllRequests();
      return allRequests.filter((request) => request.status === status);
    } catch (error: any) {
      console.error('Error fetching requests by status:', error);
      throw new Error('Failed to fetch requests by status');
    }
  }

  /**
   * Get requests by employee
   */
  async getRequestsByEmployee(employeeId: string): Promise<AssetRequest[]> {
    try {
      const allRequests = await this.getAllRequests();
      return allRequests.filter((request) => request.employeeId === employeeId);
    } catch (error: any) {
      console.error('Error fetching requests by employee:', error);
      throw new Error('Failed to fetch requests by employee');
    }
  }

  /**
   * Validate asset request data
   */
  validateRequestData(requestData: AssetRequestData): ValidationResult {
    const errors: string[] = [];

    if (!requestData.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }

    if (!requestData.items || !Array.isArray(requestData.items)) {
      errors.push('Items array is required');
    } else if (requestData.items.length === 0) {
      errors.push('At least one item is required');
    } else {
      requestData.items.forEach((item, index) => {
        if (!item.assetId?.trim()) {
          errors.push(`Item ${index + 1}: Asset ID is required`);
        }
        if (!item.quantity || item.quantity < 1) {
          errors.push(`Item ${index + 1}: Quantity must be at least 1`);
        }
        if (!Number.isInteger(item.quantity)) {
          errors.push(`Item ${index + 1}: Quantity must be a whole number`);
        }
      });
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Check if request can be modified (only PENDING requests)
   */
  canModifyRequest(request: AssetRequest): boolean {
    return request.status === 'PENDING';
  }

  /**
   * Check if request can be approved and issued (only PENDING requests)
   */
  canApproveAndIssueRequest(request: AssetRequest): boolean {
    return request.status === 'PENDING';
  }

  /**
   * Check if request can be rejected (only PENDING requests)
   */
  canRejectRequest(request: AssetRequest): boolean {
    return request.status === 'PENDING';
  }
}

// Singleton export
const assetRequestService = new AssetRequestService();
export default assetRequestService;

// Export individual methods for convenience
export const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  deleteRequest,
  approveAndIssueRequest,
  rejectRequest,
  getItemsForProcurement,
  getItemForProcurementById,
  updateProcurementStatus,
  getRequestsByStatus,
  getRequestsByEmployee,
  validateRequestData,
  canModifyRequest,
  canApproveAndIssueRequest,
  canRejectRequest,
} = assetRequestService;