import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { ProformaInvoiceService, CreateProformaDto, UpdateProformaDto } from './proforma-invoice.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { Response } from 'express';

@Controller('proforma-invoices')
@UseGuards(AdminJwtAuthGuard)
export class ProformaInvoiceController {
    constructor(private readonly proformaService: ProformaInvoiceService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateProformaDto, @Req() req: RequestWithAdmin) {
        createDto.createdByAdminId = req.admin?.id;
        return this.proformaService.create(createDto);
    }

    @Get()
    async findAll(@Query() filters: any) {
        return this.proformaService.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.proformaService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdateProformaDto) {
        return this.proformaService.update(id, updateDto);
    }

    @Post(':id/submit')
    async submit(@Param('id') id: string) {
        return this.proformaService.submit(id);
    }

    @Post(':id/send')
    async sendByEmail(@Param('id') id: string, @Body() body: { email?: string }) {
        return this.proformaService.sendByEmail(id, body.email);
    }

    @Post(':id/mark-as-paid')
    async markAsPaid(
        @Param('id') id: string,
        @Req() req: RequestWithAdmin,
        @Body() body: { employeeId?: string }
    ) {
        return this.proformaService.markAsPaid(id, req.admin!.id, body.employeeId);
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.proformaService.cancel(id, body.reason);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.proformaService.remove(id);
    }
}

/** Public controller — no AdminJwtAuthGuard, secured by signed JWT in query param */
@Controller('proforma-invoices')
export class ProformaPublicController {
    constructor(private readonly proformaService: ProformaInvoiceService) { }

    @Get(':id/pdf')
    async downloadPdf(
        @Param('id') id: string,
        @Query('token') token: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        // Verify the signed token — throws 401 if invalid or expired
        const proformaId = this.proformaService.verifyDownloadToken(token);

        // Generate the PDF buffer
        const buffer = await this.proformaService.generatePdfBuffer(proformaId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Proforma-${id}.pdf"`,
            'Content-Length': buffer.length,
        });

        return new StreamableFile(buffer);
    }
}
