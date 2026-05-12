import { Controller, Get, Post, Put, Delete, Body, Param, ConflictException, UploadedFiles, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientGateway } from './client.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientFileFields, ClientUploadConfig } from 'src/common/utils/file-upload.utils';
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('clients')
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly clientGateway: ClientGateway,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(DualAuthGuard)
  @UseInterceptors(FileFieldsInterceptor(ClientFileFields, ClientUploadConfig))
  async create(
    @UploadedFiles() files: { profileImg?: Express.Multer.File[] },
    @Req() req: RequestWithAdminEmployee,
    @Body() body: {
      firstname: string;
      lastname: string;
      email: string;
      phone?: string;
      address?: string;
      profileImage?: string;
    },
  ) {
    const adminId = req.admin?.id ?? req.employee?.adminId;

    const existingClient = await this.prisma.client.findFirst({
      where: { adminId, phone: body.phone },
    });
    if (existingClient) {
      throw new ConflictException('Client already exists with provided phone');
    }

    if (files?.profileImg?.[0]?.filename) {
      body.profileImage = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }
    const employeeId = req.employee?.id ?? null;
    const createdClient = await this.clientService.create(body, adminId, employeeId);
    this.clientGateway.emitClientCreated(createdClient);
    return createdClient;
  }

  @Get()
  @UseGuards(DualAuthGuard)
  async findAll(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    const employeeId = req.employee?.id ?? null;
    return await this.clientService.findAll(adminId, employeeId);
  }

  @Get(':id')
  @UseGuards(DualAuthGuard)
  async findOne(@Req() req: RequestWithAdminEmployee, @Param('id') id: string) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.clientService.findOne(id, adminId);
  }

  @Put(':id')
  @UseInterceptors(FileFieldsInterceptor(ClientFileFields, ClientUploadConfig))
  async update(
    @UploadedFiles() files: { profileImg?: Express.Multer.File[] },
    @Param('id') id: string,
    @Body() body: {
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: string;
      address?: string;
      profileImage?: string;
    },
  ) {
    if (files?.profileImg?.[0]?.filename) {
      body.profileImage = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }
    const updatedClient = await this.clientService.update(id, body);
    this.clientGateway.emitClientUpdated(updatedClient);
    return updatedClient;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedClient = await this.clientService.remove(id);
    this.clientGateway.emitClientDeleted(id);
    return deletedClient;
  }
}
