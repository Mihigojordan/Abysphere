import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import type { Contract, ContractData } from '../types/model';

// Define contract statuses for consistency
const CONTRACT_STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING'] as const;
type ContractStatus = typeof CONTRACT_STATUSES[number];

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Contract Service
 * Handles all contract-related API calls
 */
class ContractService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new contract
   * @param contractData - Contract creation data
   * @returns Created contract
   */
  async createContract(contractData: ContractData): Promise<Contract> {
    try {
      const response: AxiosResponse<Contract> = await this.api.post('/contracts', contractData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating contract:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all contracts
   * @returns Array of contracts with included employee
   */
  async getAllContracts(): Promise<Contract[]> {
    try {
      const response: AxiosResponse<Contract[]> = await this.api.get('/contracts');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch contracts';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get contract by ID
   * @param id - Contract ID
   * @returns Contract with included employee or null if not found
   */
  async getContractById(id: string): Promise<Contract | null> {
    try {
      const response: AxiosResponse<Contract> = await this.api.get(`/contracts/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching contract by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get contracts by employee ID
   * @param employeeId - Employee ID
   * @returns Array of contracts associated with the employee
   */
  async getContractsByEmployeeId(employeeId: string): Promise<Contract[]> {
    try {
      const response: AxiosResponse<Contract[]> = await this.api.get(`/contracts/employee/${employeeId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching contracts by employee ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch contracts for employee';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a contract
   * @param id - Contract ID
   * @param updateData - Data to update
   * @returns Updated contract
   */
  async updateContract(id: string, updateData: Partial<ContractData>): Promise<Contract> {
    try {
      const response: AxiosResponse<Contract> = await this.api.put(`/contracts/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating contract:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a contract
   * @param id - Contract ID
   * @returns Promise resolving to void
   */
  async deleteContract(id: string): Promise<void> {
    try {
      await this.api.delete(`/contracts/${id}`);
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate contract data before sending to backend
   * @param contractData - Contract data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateContractData(contractData: Partial<ContractData>): ValidationResult {
    const errors: string[] = [];

    if (!contractData.contractType) {
      errors.push('Contract type is required');
    }

    if (!contractData.startDate) {
      errors.push('Start date is required');
    } else {
      // Validate date format (ISO string)
      const startDate = new Date(contractData.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Start date must be a valid ISO date string');
      }
    }

    if (contractData.salary == null || contractData.salary < 0) {
      errors.push('Salary is required and must be a positive number');
    }

    // Optional field validations
    if (contractData.endDate) {
      const endDate = new Date(contractData.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push('End date must be a valid ISO date string');
      } else if (contractData.startDate) {
        const startDate = new Date(contractData.startDate);
        if (endDate <= startDate) {
          errors.push('End date must be after start date');
        }
      }
    }

    // Validate status if provided
    if (contractData.status && !CONTRACT_STATUSES.includes(contractData.status as ContractStatus)) {
      errors.push(`Status must be one of: ${CONTRACT_STATUSES.join(', ')}`);
    }

    // Validate currency if provided
    if (contractData.currency && typeof contractData.currency !== 'string') {
      errors.push('Currency must be a valid string');
    }

    // Validate benefits if provided
    if (contractData.benefits && typeof contractData.benefits !== 'string') {
      errors.push('Benefits must be a valid string');
    }

    // Validate workingHours if provided
    if (contractData.workingHours && typeof contractData.workingHours !== 'string') {
      errors.push('Working hours must be a valid string');
    }

    // Validate probationPeriod if provided
    if (contractData.probationPeriod && typeof contractData.probationPeriod !== 'string') {
      errors.push('Probation period must be a valid string');
    }

    // Validate terminationConditions if provided
    if (contractData.terminationConditions && typeof contractData.terminationConditions !== 'string') {
      errors.push('Termination conditions must be a valid string');
    }

    // Validate terms if provided
    if (contractData.terms && typeof contractData.terms !== 'string') {
      errors.push('Terms must be a valid string');
    }

    // Validate employeeId if provided
    if (contractData.employeeId && typeof contractData.employeeId !== 'string') {
      errors.push('Employee ID must be a valid string');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Assign an employee to a contract
   * @param contractId - Contract ID
   * @param employeeId - Employee ID to assign
   * @returns Updated contract
   */
  async assignEmployeeToContract(contractId: string, employeeId: string): Promise<Contract> {
    try {
      const response: AxiosResponse<Contract> = await this.api.put(`/contracts/${contractId}`, {
        employeeId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning employee to contract:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to assign employee to contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove employee from a contract
   * @param contractId - Contract ID
   * @returns Updated contract with no assigned employee
   */
  async removeEmployeeFromContract(contractId: string): Promise<Contract> {
    try {
      const response: AxiosResponse<Contract> = await this.api.put(`/contracts/${contractId}`, {
        employeeId: null
      });
      return response.data;
    } catch (error: any) {
      console.error('Error removing employee from contract:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to remove employee from contract';
      throw new Error(errorMessage);
    }
  }

  /**
   * Download contract PDF
   * @param contractId - Contract ID
   * @returns Blob containing the contract PDF
   */
  async downloadContractPDF(contractId: string): Promise<Blob> {
    try {
      const response: AxiosResponse<Blob> = await this.api.get(`/contracts/${contractId}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error downloading contract PDF:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to download contract PDF';
      throw new Error(errorMessage);
    }
  }
}

// Singleton instance
const contractService = new ContractService();
export default contractService;

// Named exports for individual methods
export const {
  createContract,
  getAllContracts,
  getContractById,
  getContractsByEmployeeId,
  updateContract,
  deleteContract,
  validateContractData,
  assignEmployeeToContract,
  removeEmployeeFromContract,
  downloadContractPDF,
} = contractService;