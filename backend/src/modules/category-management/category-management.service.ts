import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class CategoryManagementService {
  constructor(
    private readonly prismaService: PrismaService,

  ) {}
  async createCategory(data: {
    name?: string;
    description?: string;
    adminId?: string;
    employeeId?: string;
  }) {
    try {
      const { name, description } = data;

      if (!name) {
        throw new BadRequestException('Category name is required');
      }

      const categoryExists = await this.prismaService.category.findFirst({
        where: { name },
      });

      if (categoryExists) {
        throw new BadRequestException('Category already exists');
      }

      const createdCategory = await this.prismaService.category.create({
        data: { name, description, adminId: data.adminId, employeeId: data.employeeId ?? null },
      });

      
      return {
        message: 'Category created successfully',
        category: createdCategory,
      };
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(error.message);
    }
  }

  async getAllCategories(adminId: string, employeeId?: string | null) {
    try {
      if (employeeId) {
        const assignments = await this.prismaService.employeePermissionAssignment.findMany({
          where: { employeeId, adminId },
          include: { template: true },
        });
        const catPerms = assignments.filter(a => a.template.featureName === 'CATEGORY_MANAGEMENT');
        const canViewAll = catPerms.some(a => a.template.canViewAll);
        const canViewOwn = catPerms.some(a => a.template.canViewOwn);
        // If view_own (and not view_all): show only their own
        // Otherwise (view_all or no category permission): show all company categories
        if (canViewOwn && !canViewAll) {
          return this.prismaService.category.findMany({ where: {  employeeId } });
        }
        return this.prismaService.category.findMany({ where: { adminId } });
      }
      return this.prismaService.category.findMany({ where: { adminId } });
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error(error.message);
    }
  }

  private async canEmployeeViewAll(employeeId: string, adminId: string, featureName: string): Promise<boolean> {
    const assignments = await this.prismaService.employeePermissionAssignment.findMany({
      where: { employeeId, adminId },
      include: { template: true },
    });
    return assignments.some(a => a.template.featureName === featureName && a.template.canViewAll);
  }

  async getCategoryById(id: string) {
    try {
      if (!id) throw new BadRequestException('Category ID is required');

      const category = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!category) throw new BadRequestException('Category not found');

      return category;
    } catch (error) {
      console.error('Error getting category:', error);
      throw new Error(error.message);
    }
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      description?: string;
      adminId?: string;
      employeeId?: string;
    },
  ) {
    try {
      if (!id) throw new BadRequestException('Category ID is required');

      const existing = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!existing) throw new BadRequestException('Category not found');

      const updated = await this.prismaService.category.update({
        where: { id },
        data: {
          name: data.name ?? existing.name,
          description: data.description ?? existing.description
        }
      });

     

      return {
        message: 'Category was updated successfully',
        category: updated,
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error(error.message);
    }
  }

  async deleteCategory(id: string, data:Partial<{ adminId:string, employeeId?:string  }>) {
    try {
      if (!id) throw new BadRequestException('Category ID is required');

      const deleted = await this.prismaService.category.delete({
        where: { id },
      });


      return {
        message: 'Category deleted successfully',
        category: deleted,
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error(error.message);
    }
  }
}
