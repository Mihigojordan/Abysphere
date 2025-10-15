import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios';

import type { Client } from '../types/model';

// Interfaces for input data
export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & {
  profileImgFile?: File | null; // frontend file upload support
};
export type UpdateClientInput = Partial<CreateClientInput>;

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  message: string;
}

/**
 * Client Service
 * Handles all client-related API calls (with file upload support)
 */
class ClientService {
  private api: AxiosInstance = api;

  /**
   * Create a new client (supports file upload)
   */
  async createClient(clientData: CreateClientInput): Promise<Client> {
    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(clientData).forEach(([key, value]) => {
        if (value && key !== 'profileImgFile') {
          formData.append(key, value as string);
        }
      });

      // Append file if exists
      if (clientData.profileImgFile) {
        formData.append('profileImg', clientData.profileImgFile);
      }

      const response: AxiosResponse<Client> = await this.api.post('/clients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating client:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create client';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all clients
   */
  async getAllClients(): Promise<Client[]> {
    try {
      const response: AxiosResponse<Client[]> = await this.api.get('/clients');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch clients';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get client by ID
   */
  async getClientById(id: string): Promise<Client | null> {
    try {
      const response: AxiosResponse<Client> = await this.api.get(`/clients/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching client by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch client';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a client (supports file upload)
   */
  async updateClient(id: string, updateData: UpdateClientInput): Promise<Client> {
    try {
      const formData = new FormData();

      Object.entries(updateData).forEach(([key, value]) => {
        if (value && key !== 'profileImgFile') {
          formData.append(key, value as string);
        }
      });

      if (updateData.profileImgFile) {
        formData.append('profileImg', updateData.profileImgFile);
      }

      const response: AxiosResponse<Client> = await this.api.put(`/clients/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating client:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update client';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/clients/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting client:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete client';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate client data before sending to backend
   */
  validateClientData(clientData: any): ValidationResult {
    const errors: string[] = [];

    if (!clientData.firstname?.trim()) {
      errors.push('First name is required');
    }

    if (!clientData.lastname?.trim()) {
      errors.push('Last name is required');
    }

    if (!clientData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(clientData.email)) {
      errors.push('Email format is invalid');
    }

    if (clientData.phone && !/^\+?[0-9\s-]{7,15}$/.test(clientData.phone)) {
      errors.push('Phone number format is invalid');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const clientService = new ClientService();
export default clientService;

// Named exports
export const {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  validateClientData,
} = clientService;
