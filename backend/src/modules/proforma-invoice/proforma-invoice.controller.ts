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
} from '@nestjs/common';
import { ProformaInvoiceService, CreateProformaDto, UpdateProformaDto } from './proforma-invoice.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

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
