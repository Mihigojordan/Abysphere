import { Module } from '@nestjs/common';
import { ProformaInvoiceController } from './proforma-invoice.controller';
import { ProformaInvoiceService } from './proforma-invoice.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [ProformaInvoiceController],
    providers: [ProformaInvoiceService, PrismaService],
    exports: [ProformaInvoiceService],
})
export class ProformaInvoiceModule { }
