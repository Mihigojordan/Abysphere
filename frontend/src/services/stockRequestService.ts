import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api';

// Type definitions for request and request items
export type RequestStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'PARTIALLY_ISSUED' 
  | 'ISSUED' 
  | 'CLOSED';

export interface RequestItem {
  id: string;
  stockInId: string;
  qtyRequested: number;
  qtyIssued?: number;
  qtyRemaining?: number;
  qtyReceived?: number;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  uploadedBy: 'ADMIN' | 'EMPLOYEE';
  uploadedById: string;
  uploadedAt: string;
  description?: string;
}

export interface Comment {
  userId: string;
  role: 'ADMIN' | 'EMPLOYEE';
  description: string;
  uploadedAt: string;
}

export interface Request {
  id: string;
  ref_no: string;
  siteId: string;
  requestedByAdminId?: string;
  requestedByEmployeeId?: string;
  status: RequestStatus;
  notes?: string;
  requestItems: RequestItem[];
  attachments?: Attachment[];
  comments?: Comment[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Input types
export type CreateRequestInput = Omit<Request, 'id' | 'status' | 'requestItems' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'> & {
  items: { stockInId: string; qtyRequested: number }[];
};

export type UpdateRequestInput = Partial<CreateRequestInput>;

export type ApproveRequestInput = {
  approvedByAdminId?: string;
  approvedByEmployeeId?: string;
  itemModifications?: Array<{
    requestItemId: string;
    qtyRequested?: number;
    qtyApproved?: number;
    stockInId?: string;
  }>;
  itemsToAdd?: Array<{ stockInId: string; qtyRequested: number; qtyApproved?: number }>;
  itemsToRemove?: string[];
  comment?: string;
};

export type IssueMaterialsInput = {
  requestId: string;
  issuedByAdminId?: string;
  issuedByEmployeeId?: string;
  items: Array<{ requestItemId: string; qtyIssued: number; notes?: string }>;
};

export type ReceiveMaterialsInput = {
  requestId: string;
  receivedByAdminId?: string;
  receivedByEmployeeId?: string;
  items: Array<{ requestItemId: string; qtyReceived: number }>;
};

// Frontend service
class RequestService {
  private api: AxiosInstance = api;
  private baseUrl = '/stock-requests';

  // Create request
  async createRequest(data: CreateRequestInput): Promise<Request> {
    try {
      const response: AxiosResponse<{ data: { request: Request } }> = await this.api.post(`${this.baseUrl}`, data);
      return response.data.data.request;
    } catch (error: any) {
      console.error('Error creating request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create request');
    }
  }

  // Get all requests
  async getAllRequests(): Promise<{ data: { requests: Request[] } }> {
    try {
      const response: AxiosResponse<{ data: { requests: Request[] } }> = await this.api.get(`${this.baseUrl}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch requests');
    }
  }

  // Get request by ID
  async getRequestById(id: string): Promise<Request | null> {
    try {
      const response: AxiosResponse<{ data: { request: Request } }> = await this.api.get(`${this.baseUrl}/${id}`);
      return response.data.data.request;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching request by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch request');
    }
  }

  // Approve request
  async approveRequest(id: string, data: ApproveRequestInput): Promise<Request> {
    try {
      const response: AxiosResponse<Request> = await this.api.patch(`${this.baseUrl}/${id}/approve`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error approving request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to approve request');
    }
  }

  // Reject request
  async rejectRequest(id: string, notes?: string): Promise<Request> {
    try {
      const response: AxiosResponse<Request> = await this.api.patch(`${this.baseUrl}/${id}/reject`, { notes });
      return response.data;
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to reject request');
    }
  }

  // Issue materials
  async issueMaterials(data: IssueMaterialsInput): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post(`${this.baseUrl}/issue-materials`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error issuing materials:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to issue materials');
    }
  }

  // Receive materials
  async receiveMaterials(data: ReceiveMaterialsInput): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post(`${this.baseUrl}/receive-materials`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error receiving materials:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to receive materials');
    }
  }

  // Update request
  async updateRequest(id: string, data: UpdateRequestInput): Promise<Request> {
    try {
      const response: AxiosResponse<{ data: { request: Request } }> = await this.api.patch(`${this.baseUrl}/${id}/modify-approve`, data);
      return response.data.data.request;
    } catch (error: any) {
      console.error('Error updating request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update request');
    }
  }

  // Upload attachment
  async uploadAttachment(
    id: string,
    file: File,
    body: { role: string; userId: string; description?: string }
  ): Promise<Attachment[]> {
    try {
      const formData = new FormData();
      formData.append('attachmentImg', file);
      formData.append('role', body.role);
      formData.append('userId', body.userId);
      if (body.description) formData.append('description', body.description);
      formData.append('createdAt', new Date().toISOString());

      const response: AxiosResponse<{ data: { attachments: Attachment[] } }> = await this.api.post(
        `${this.baseUrl}/${id}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.attachments;
    } catch (error: any) {
      console.error('Error uploading attachment:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload attachment');
    }
  }

  // Add comment
  async addComment(
    id: string,
    data: { userId: string; role: string; description: string; uploadedAt?: string }
  ): Promise<Comment[]> {
    try {
      const response: AxiosResponse<{ data: { comments: Comment[] } }> = await this.api.post(
        `${this.baseUrl}/${id}/comments`,
        data
      );
      return response.data.comments;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
    }
  }

  // Delete request
  async deleteRequest(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete request');
    }
  }
}

// Export singleton instance
const requestService = new RequestService();
export default requestService;

export const {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  issueMaterials,
  receiveMaterials,
  updateRequest,
  uploadAttachment,
  addComment,
  deleteRequest,
} = requestService;