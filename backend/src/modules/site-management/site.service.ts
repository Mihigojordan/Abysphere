import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  // Create a new site
  async createSite(data: any) {
    try {
      const { managerId, supervisorId, ...rest } = data;

      // Validation: manager cannot be same as supervisor
      if (managerId && supervisorId && managerId === supervisorId) {
        throw new BadRequestException(
          'Manager and Supervisor cannot be the same employee',
        );
      }

      const site = await this.prisma.site.create({
        data: {
          managerId,
          supervisorId,
          ...rest,
        },
      });

      return site;
    } catch (error) {
      throw error;
    }
  }

  // Get all sites with relations
  async getSites() {
    try {
      return await this.prisma.site.findMany({
        include: {
          manager: true,
          supervisor: true,
          employees: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Get single site by ID
  async getSiteById(id: string) {
    try {
      return await this.prisma.site.findUnique({
        where: { id },
        include: { manager: true, supervisor: true, employees: true },
      });
    } catch (error) {
      throw error;
    }
  }

  // Assign multiple employees to a site
  async assignEmployees(siteId: string, employeeIds: string[], managerId?: string, supervisorId?: string) {
    try {
      // Optional validation: prevent assigning manager or supervisor as regular employee
      const filteredIds = employeeIds.filter(
        (id) => id !== managerId && id !== supervisorId,
      );

      return await this.prisma.employee.updateMany({
        where: { id: { in: filteredIds } },
        data: { id: siteId },
      });
    } catch (error) {
      throw error;
    }
  }


  // Update site details
async updateSite(id: string, data: any) {
  try {
    const { managerId, supervisorId, ...rest } = data;

    // Validation: manager cannot be same as supervisor
    if (managerId && supervisorId && managerId === supervisorId) {
      throw new BadRequestException(
        'Manager and Supervisor cannot be the same employee',
      );
    }

    return await this.prisma.site.update({
      where: { id },
      data: {
        managerId,
        supervisorId,
        ...rest,
      },
    });
  } catch (error) {
    throw error;
  }
}

// Delete a site
async deleteSite(id: string) {
  try {
    return await this.prisma.site.delete({
      where: { id },
    });
  } catch (error) {
    throw error;
  }
}
}
