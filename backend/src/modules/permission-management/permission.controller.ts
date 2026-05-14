import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('permissions')
@UseGuards(AdminJwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('templates')
  getTemplates(@Req() req: RequestWithAdmin) {
    return this.permissionService.getTemplates(req.admin!.id);
  }

  @Post('templates')
  createTemplate(
    @Req() req: RequestWithAdmin,
    @Body()
    body: {
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
    return this.permissionService.createTemplate(req.admin!.id, body);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Req() req: RequestWithAdmin,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      description?: string;
      canViewOwn?: boolean;
      canViewAll?: boolean;
      canCreate?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    },
  ) {
    return this.permissionService.updateTemplate(req.admin!.id, id, body);
  }

  @Delete('templates/:id')
  deleteTemplate(@Req() req: RequestWithAdmin, @Param('id') id: string) {
    return this.permissionService.deleteTemplate(req.admin!.id, id);
  }

  @Get('templates/:id/employees')
  getTemplateEmployees(@Req() req: RequestWithAdmin, @Param('id') id: string) {
    return this.permissionService.getTemplateEmployees(req.admin!.id, id);
  }

  @Post('assign')
  assignTemplate(
    @Req() req: RequestWithAdmin,
    @Body() body: { employeeId: string; templateId: string },
  ) {
    return this.permissionService.assignTemplate(
      req.admin!.id,
      body.employeeId,
      body.templateId,
    );
  }

  @Patch('assign/:employeeId/:templateId')
  updateAssignment(
    @Req() req: RequestWithAdmin,
    @Param('employeeId') employeeId: string,
    @Param('templateId') templateId: string,
    @Body()
    body: {
      canViewOwn?: boolean;
      canViewAll?: boolean;
      canCreate?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    },
  ) {
    return this.permissionService.updateAssignment(
      req.admin!.id,
      employeeId,
      templateId,
      body,
    );
  }

  @Delete('assign/:employeeId/:templateId')
  revokeTemplate(
    @Req() req: RequestWithAdmin,
    @Param('employeeId') employeeId: string,
    @Param('templateId') templateId: string,
  ) {
    return this.permissionService.revokeTemplate(
      req.admin!.id,
      employeeId,
      templateId,
    );
  }
}
