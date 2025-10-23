import api from "../api/api";

export interface DemoRequest {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companySize?: string;
  message?: string;
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt?: string;
}

const demoRequestService = {
  findAll: async (): Promise<DemoRequest[]> => {
    const response = await api.get<DemoRequest[]>("/demo-requests");
    return response.data;
  },

  findOne: async (id: number): Promise<DemoRequest> => {
    const response = await api.get<DemoRequest>(`/demo-requests/${id}`);
    return response.data;
  },

  create: async (data: Partial<DemoRequest>): Promise<DemoRequest> => {
    const response = await api.post<DemoRequest>("/demo-requests", data);
    return response.data;
  },

  update: async (id: number, data: Partial<DemoRequest>): Promise<DemoRequest> => {
    const response = await api.put<DemoRequest>(`/demo-requests/${id}`, data);
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/demo-requests/${id}`);
  },

  approve: async (id: number): Promise<DemoRequest> => {
    const response = await api.put<DemoRequest>(`/demo-requests/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<DemoRequest> => {
    const response = await api.put<DemoRequest>(`/demo-requests/${id}/reject`, { reason });
    return response.data;
  },
};

export default demoRequestService;
