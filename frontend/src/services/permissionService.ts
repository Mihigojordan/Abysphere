import api from '../api/api';
import type { PermissionTemplate } from '../types/model';

interface EmployeeWithAssignment {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  position?: string;
  department?: string;
  profile_picture?: string;
  status: string;
  isAssigned: boolean;
}

class PermissionService {
  // ── Templates ─────────────────────────────────────────────────────────────

  async getTemplates(): Promise<PermissionTemplate[]> {
    const res = await api.get('/permissions/templates');
    return res.data;
  }

  async createTemplate(data: {
    name: string;
    description?: string;
    featureName: string;
    canViewOwn?: boolean;
    canViewAll?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  }): Promise<PermissionTemplate> {
    const res = await api.post('/permissions/templates', data);
    return res.data;
  }

  async updateTemplate(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      canViewOwn: boolean;
      canViewAll: boolean;
      canCreate: boolean;
      canUpdate: boolean;
      canDelete: boolean;
    }>,
  ): Promise<PermissionTemplate> {
    const res = await api.patch(`/permissions/templates/${id}`, data);
    return res.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await api.delete(`/permissions/templates/${id}`);
  }

  // ── Assignments ────────────────────────────────────────────────────────────

  async getTemplateEmployees(templateId: string): Promise<EmployeeWithAssignment[]> {
    const res = await api.get(`/permissions/templates/${templateId}/employees`);
    return res.data;
  }

  async assignTemplate(employeeId: string, templateId: string): Promise<void> {
    await api.post('/permissions/assign', { employeeId, templateId });
  }

  async revokeTemplate(employeeId: string, templateId: string): Promise<void> {
    await api.delete(`/permissions/assign/${employeeId}/${templateId}`);
  }
}

export type { EmployeeWithAssignment };
export default new PermissionService();
