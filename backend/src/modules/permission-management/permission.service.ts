import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(adminId: string) {
    return this.prisma.permissionTemplate.findMany({
      where: { adminId },
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: [{ featureName: 'asc' }, { name: 'asc' }],
    });
  }

  async createTemplate(
    adminId: string,
    data: {
      name: string;
      description?: string;
      featureName: string;
      canViewOwn?: boolean;
      canViewAll?: boolean;
      canCreate?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    },
  ) {
    // Verify the company has this feature assigned by SuperAdmin
    const adminFeature = await this.prisma.adminFeature.findFirst({
      where: {
        adminId,
        feature: { name: data.featureName },
      },
    });

    if (!adminFeature) {
      throw new ForbiddenException(
        `Your company does not have access to feature: ${data.featureName}`,
      );
    }

    const existing = await this.prisma.permissionTemplate.findFirst({
      where: { adminId, name: data.name, featureName: data.featureName },
    });
    if (existing) {
      throw new ConflictException(
        'A permission template with this name already exists for this feature',
      );
    }

    return this.prisma.permissionTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        featureName: data.featureName,
        adminId,
        canViewOwn: data.canViewOwn ?? false,
        canViewAll: data.canViewAll ?? false,
        canCreate: data.canCreate ?? false,
        canUpdate: data.canUpdate ?? false,
        canDelete: data.canDelete ?? false,
      },
    });
  }

  async updateTemplate(
    adminId: string,
    templateId: string,
    data: {
      name?: string;
      description?: string;
      canViewOwn?: boolean;
      canViewAll?: boolean;
      canCreate?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    },
  ) {
    const template = await this.prisma.permissionTemplate.findFirst({
      where: { id: templateId, adminId },
    });
    if (!template) throw new NotFoundException('Permission template not found');

    return this.prisma.permissionTemplate.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(adminId: string, templateId: string) {
    const template = await this.prisma.permissionTemplate.findFirst({
      where: { id: templateId, adminId },
    });
    if (!template) throw new NotFoundException('Permission template not found');

    return this.prisma.permissionTemplate.delete({ where: { id: templateId } });
  }

  async getTemplateEmployees(adminId: string, templateId: string) {
    const template = await this.prisma.permissionTemplate.findFirst({
      where: { id: templateId, adminId },
    });
    if (!template) throw new NotFoundException('Permission template not found');

    const employees = await this.prisma.employee.findMany({
      where: { adminId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        position: true,
        department: true,
        profile_picture: true,
        status: true,
        assignments: {
          where: { templateId },
          select: { id: true },
        },
      },
      orderBy: [{ first_name: 'asc' }],
    });

    return employees.map(({ assignments, ...emp }) => ({
      ...emp,
      isAssigned: assignments.length > 0,
    }));
  }

  async assignTemplate(
    adminId: string,
    employeeId: string,
    templateId: string,
  ) {
    const [template, employee] = await Promise.all([
      this.prisma.permissionTemplate.findFirst({
        where: { id: templateId, adminId },
      }),
      this.prisma.employee.findFirst({ where: { id: employeeId, adminId } }),
    ]);

    if (!template) throw new NotFoundException('Permission template not found');
    if (!employee) throw new NotFoundException('Employee not found');

    const existing = await this.prisma.employeePermissionAssignment.findFirst({
      where: { employeeId, templateId },
    });
    if (existing)
      throw new ConflictException('Employee already has this permission');

    return this.prisma.employeePermissionAssignment.create({
      data: { employeeId, templateId, adminId },
    });
  }

  async revokeTemplate(
    adminId: string,
    employeeId: string,
    templateId: string,
  ) {
    const assignment = await this.prisma.employeePermissionAssignment.findFirst(
      {
        where: { employeeId, templateId, adminId },
      },
    );
    if (!assignment) throw new NotFoundException('Assignment not found');

    return this.prisma.employeePermissionAssignment.delete({
      where: { id: assignment.id },
    });
  }

  async getEmployeePermissions(employeeId: string) {
    const assignments = await this.prisma.employeePermissionAssignment.findMany(
      {
        where: { employeeId },
        include: { template: true },
      },
    );
    return assignments.map((a) => a.template);
  }
}
