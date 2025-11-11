import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { EmailService } from 'src/global/email/email.service';
import { last } from 'rxjs';
import { addDays } from 'date-fns'; 

@Injectable()
export class CompanyService {
    constructor(
        private prisma: PrismaService,
        private email: EmailService,
    ) {}

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
            // send email to company with generated password
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


     /**
   * Set or update an admin's message and message expiry.
   * @param adminId - The UUID of the admin.
   * @param message - The message text to display.
   * @param expiryDate - Optional expiry date for the message.
   *                     If not provided, defaults to 24 hours from now.
   */
  async setAdminMessage(
    adminId: string,
    message?: string,
    expiryDate?: Date,
  ) {
    // Ensure the admin exists
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    const finalExpiry = expiryDate ?? addDays(new Date(), 1); // Default: 1 day later

    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        message,
        messageExpiry: finalExpiry,
      },
    });

    return {
      success: true,
      message: `Message set for admin ${admin.adminName ?? admin.id}`,
      data: updatedAdmin,
    };
  }

  /**
   * Optional: clear message if expired
   */
  async clearAdminMessages(adminId:string) {
    const now = new Date();

    const cleared = await this.prisma.admin.updateMany({
      where: {
        id: adminId,
      },
      data: {
        message: null,
        messageExpiry: null,
        isMessage:false,
      },
    });

    return {
      success: true,
      clearedCount: cleared.count,
    };
  }

    // =====================================================
    // 🔹 FEATURE MANAGEMENT METHODS (Company ↔ SystemFeature)
    // =====================================================

    /**
     * ✅ Assign one or more features to an admin
     */
async assignFeaturesToCompany(adminId: string, featureIds: string[]) {
  const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new NotFoundException('Company not found');

  // Create connections in join table
  await this.prisma.adminFeature.createMany({
    data: featureIds.map((featureId) => ({ adminId, featureId })),
    skipDuplicates: true,
  });

  // Fetch features joined with their feature data
  const adminWithFeatures = await this.prisma.admin.findUnique({
    where: { id: adminId },
    include: { features: { include: { feature: true } } },
  });

  // ✅ Transform response to match your desired shape
  const features = adminWithFeatures?.features.map((f) => ({
    ...f.feature,
    adminId: f.adminId,
  }));

  return {
    ...adminWithFeatures,
    features,
  };
}

    /**
     * 🚫 Remove one or more features from an admin
     */
   async removeFeaturesFromCompany(adminId: string, featureIds: string[]) {
  const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) throw new NotFoundException('Company not found');

  await this.prisma.adminFeature.deleteMany({
    where: { adminId, featureId: { in: featureIds } },
  });

  const adminWithFeatures = await this.prisma.admin.findUnique({
    where: { id: adminId },
    include: { features: { include: { feature: true } } },
  });

  const features = adminWithFeatures?.features.map((f) => ({
    ...f.feature,
    adminId: f.adminId,
  }));

  return {
    ...adminWithFeatures,
    features,
  };
}

    /**
     * 🔍 Get all features assigned to an admin
     */
    async getCompanyFeatures(adminId: string) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: adminId },
            include: { features: true },
        });
        if (!admin) throw new NotFoundException('Company not found');

        return admin.features;
    }

    /**
     * 👑 Get all admins that have a specific feature
     */
    async getFeatureCompanys(featureId: string) {
        const feature = await this.prisma.systemFeature.findUnique({
            where: { id: featureId },
            include: { admins: true },
        });
        if (!feature) throw new NotFoundException('Feature not found');

        return feature.admins;
    }
}
