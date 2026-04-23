import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProformaInvoiceController } from './proforma-invoice.controller';
import { ProformaPublicController } from './proforma-invoice.controller';
import { ProformaInvoiceService } from './proforma-invoice.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [ProformaInvoiceController, ProformaPublicController],
    providers: [ProformaInvoiceService, PrismaService],
    imports: [
        JwtModule.register({
            secret: process.env.Jwt_SECRET_KEY,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    exports: [ProformaInvoiceService],
})
export class ProformaInvoiceModule { }

