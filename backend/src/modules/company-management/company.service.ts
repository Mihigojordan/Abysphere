import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/global/email/email.service';
import { last } from 'rxjs';

@Injectable()
export class CompanyService {
    constructor(
        private prisma: PrismaService,
        private email: EmailService,
    ) { }

    // ====== Inline DTOs ======
    private createCompanyDto = class {
        adminName?: string;
        adminEmail?: string;
        phone?: string;
        profileImage?: string;
    };

    private updateCompanyDto = class {
        adminName?: string;
        phone?: string;
        profileImage?: string;
        status?: 'ACTIVE' | 'INACTIVE';
        isLocked?: boolean;
        is2FA?: boolean;
    };

    // ====== Helper: generate + hash password ======
    private async generateAndHashPassword(): Promise<any> {
        const plain = randomBytes(6).toString('hex'); // random 12-char password
        const hash = await bcrypt.hash(plain, 10);
        console.log(`🔹 Generated password for company: ${plain}`); // ⚠️ remove in prod
        return { hash, password: plain };
    }

    // ====== CREATE ======
    async create(data: InstanceType<typeof this.createCompanyDto>) {
        const { hash, password } = await this.generateAndHashPassword();

        if (data.adminEmail) {
            //send email to company with generated password
            const subject = 'Your Company Account Created';

            await this.email.sendEmail(
                data.adminEmail,
                subject,
                'Welcome-User-notification',
                {
                    firstName: data.adminName ? data.adminName.split(" ")[0] : '',
                    lastName: data.adminName ? last.call(data.adminName.split(" ")) : '',
                    email: data.adminEmail,
                    loginUrl: `${process.env.FRONTEND_URL_ONLY}/auth/admin/login`,
                    password: password,
                    year: new Date().getFullYear(),
                }
            );
        }


        return this.prisma.admin.create({
            data: {
                ...data,
                password: hash,
            },
        });
    }

    // ====== FIND ALL ======
    async findAll() {
        return this.prisma.admin.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    // ====== FIND ONE ======
    async findOne(id: string) {
        const company = await this.prisma.admin.findUnique({ where: { id } });
        if (!company) throw new NotFoundException('Company not found');
        return company;
    }

    // ====== UPDATE ======
    async update(id: string, data: InstanceType<typeof this.updateCompanyDto>) {
        const exists = await this.prisma.admin.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Company not found');

        return this.prisma.admin.update({
            where: { id },
            data,
        });
    }

    // ====== DELETE ======
    async remove(id: string) {
        const exists = await this.prisma.admin.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Company not found');

        return this.prisma.admin.delete({ where: { id } });
    }
}
