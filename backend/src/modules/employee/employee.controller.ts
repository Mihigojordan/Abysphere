// employee.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeStatus } from '../../../generated/prisma';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  EmployeeFileFields,
  EmployeeUploadConfig,
} from 'src/common/utils/file-upload.utils';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(EmployeeFileFields, EmployeeUploadConfig),
  )
  @UseGuards(AdminJwtAuthGuard)
  create(
    @UploadedFiles()
    files: {
      profileImg?: Express.Multer.File[];
    },
    @Req() req: RequestWithAdmin,
    @Body()
    createEmployeeData: {
      first_name?: string;
      last_name?: string;
      gender?: string;
      phone?: string;
      email: string;
      national_id?: string;
      profile_picture?: string;
      position?: string;
      department?: string;
      date_hired?: string;
      status?: EmployeeStatus;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
    },
  ) {
    if (files?.profileImg?.[0]?.filename) {
      createEmployeeData.profile_picture = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }

    return this.employeeService.create({
      ...createEmployeeData,
      date_hired: createEmployeeData.date_hired
        ? new Date(createEmployeeData.date_hired)
        : undefined,
      adminId: req.admin!.id,
    });
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  findAll(@Req() req: RequestWithAdmin) {
    return this.employeeService.findAll(req.admin!.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(EmployeeFileFields, EmployeeUploadConfig),
  )
  update(
    @UploadedFiles()
    files: {
      profileImg?: Express.Multer.File[];
    },
    @Param('id') id: string,
    @Body()
    updateEmployeeData: {
      first_name?: string;
      last_name?: string;
      gender?: string;
      phone?: string;
      email?: string;
      national_id?: string;
      profile_picture?: string;
      position?: string;
      department?: string;
      date_hired?: string;
      status?: EmployeeStatus;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
    },
  ) {
    const updateData: any = { ...updateEmployeeData };

    if (updateEmployeeData?.date_hired) {
      updateData.date_hired = new Date(updateEmployeeData?.date_hired);
    }

    if (files?.profileImg?.[0]?.filename) {
      updateData.profile_picture = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }

    return this.employeeService.update(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
