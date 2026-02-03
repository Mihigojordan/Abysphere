import api from '../api/api'; // Adjust path based on your project
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// Medication creation/update DTO
export interface MedicationData {
  name: string;
  dosage: string;
  method: 'FEED' | 'BATH' | 'WATER' | 'INJECTION';
  reason?: string | null;
  startDate: string; // ISO string
  endDate?: string | null;
  cageId: string;

  administeredByEmployee?: string | null; // Employee ID (optional)
  administeredByAdmin?: string | null;    // Admin ID (optional)
}

// Medication entity with ID + timestamps and relations
export interface Medication extends MedicationData {
  id: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string

  // Relations (optional)
  cage?: { id: string; cageCode: string; cageName: string };
  employee?: { id: string; first_name: string;last_name:string };
  admin?: { id: string; adminName: string };
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Delete response
export interface DeleteResponse {
  message: string;
}


/**
 * Medication Service
 * Handles all medication-related API calls
 */
class MedicationService {
  private api: AxiosInstance = api;

  /** Create new medication */
  async createMedication(data: MedicationData): Promise<Medication> {
    try {
      console.log('shit');
      const response: AxiosResponse<Medication> = await this.api.post('/medications', data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating medication:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create medication',
      );
    }
  }

  /** Get all medications */
  async getAllMedications(): Promise<Medication[]> {
    try {
      const response: AxiosResponse<Medication[]> = await this.api.get('/medications');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching medications:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch medications',
      );
    }
  }

  /** Get medications by cage ID */
  async getMedicationsByCageId(cageId: string): Promise<Medication[]> {
    try {
      const response: AxiosResponse<Medication[]> = await this.api.get(`/medications/cage/${cageId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching medications by cage ID:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch medications by cage',
      );
    }
  }

  /** Get medication by ID */
  async getMedicationById(id: string): Promise<Medication | null> {
    try {
      const response: AxiosResponse<Medication> = await this.api.get(`/medications/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching medication by ID:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch medication',
      );
    }
  }

  /** Update medication */
  async updateMedication(id: string, updateData: Partial<MedicationData>): Promise<Medication> {
    try {
      const response: AxiosResponse<Medication> = await this.api.put(`/medications/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating medication:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update medication',
      );
    }
  }

  /** Delete medication */
  async deleteMedication(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/medications/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting medication:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete medication',
      );
    }
  }

  /** Validate medication data */
  validateMedicationData(data: MedicationData): ValidationResult {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Medication name is required');
    if (!data.dosage?.trim()) errors.push('Dosage is required');
    if (!['FEED', 'BATH', 'WATER', 'INJECTION'].includes(data.method)) errors.push('Invalid method');
    if (!data.startDate) errors.push('Start date is required');
    if (!data.cageId?.trim()) errors.push('Cage ID is required');
   
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /** Check if medication exists */
  async medicationExists(id: string): Promise<boolean> {
    try {
      const med = await this.getMedicationById(id);
      return med !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance
const medicationService = new MedicationService();
export default medicationService;

// Named exports
export const {
  createMedication,
  getAllMedications,
  getMedicationsByCageId,
  getMedicationById,
  updateMedication,
  deleteMedication,
  validateMedicationData,
  medicationExists,
} = medicationService;
