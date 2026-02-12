import { Controller, Get, Post, Put, Delete, Body, Param, ConflictException, UploadedFiles, UseInterceptors, UseGuards, Req } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientGateway } from './client.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ClientFileFields, ClientUploadConfig } from 'src/common/utils/file-upload.utils';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('clients')
export class ClientController {
    constructor(
        private readonly clientService: ClientService,
        private readonly clientGateway: ClientGateway,
        private readonly prisma: PrismaService,
    ) { }

    @Post()
    @UseGuards(AdminJwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor(ClientFileFields, ClientUploadConfig)
    )
    async create(
        @UploadedFiles() files: { profileImg?: Express.Multer.File[] },
        @Req() req: RequestWithAdmin,
        @Body()
        body: {
            firstname: string;
            lastname: string;
            email: string;
            phone?: string;
            address?: string;
            profileImage?: string;
        },
    ) {
        const adminId = req.admin!.id;

        const existingClient = await this.prisma.client.findFirst({
            where: {
                OR: [
                    { phone: body.phone },
                    { email: body.email },
                ],
            },
        });

        if (existingClient) {
            throw new ConflictException(
                'Client already exists with provided phone, email, or national ID',
            );
        }

        if (files?.profileImg?.[0]?.filename) {
            body.profileImage = `/uploads/profile_images/${files.profileImg[0].filename}`;
        }
        const createdClient = await this.clientService.create(body,adminId);
        this.clientGateway.emitClientCreated(createdClient);
        return createdClient;
    }

    @Get()
    @UseGuards(AdminJwtAuthGuard)
    async findAll(@Req() req: RequestWithAdmin,) {
        const adminId = req.admin!.id;
        return await this.clientService.findAll(adminId);
    }

    @Get(':id')
    @UseGuards(AdminJwtAuthGuard)
    async findOne(@Req() req: RequestWithAdmin,@Param('id') id: string) {
        const adminId = req.admin!.id;
        return await this.clientService.findOne(id,adminId);
    }

    @Put(':id')
     @UseInterceptors(
        FileFieldsInterceptor(ClientFileFields, ClientUploadConfig)
    )
    async update(
        @UploadedFiles() files: { profileImg?: Express.Multer.File[] },
        @Param('id') id: string,
        @Body()
        body: {
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
