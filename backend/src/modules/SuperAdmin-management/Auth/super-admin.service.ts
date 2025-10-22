import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { OTPService } from 'src/global/otp/otp.service';
import { EmailService } from 'src/global/email/email.service';

@Injectable()
export class SuperAdminService {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtServices: JwtService,
    private readonly otpService: OTPService,
    private readonly email: EmailService,
  ) {}

  async findSuperAdminById(id: string) {
    if (!id) throw new BadRequestException('SuperAdmin ID is required');

    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { id },
    });
    return superAdmin;
  }

  async findSuperAdminByEmail(email: string) {
    if (!email) throw new BadRequestException('SuperAdmin email is required');

    const superAdmin = await this.prisma.superAdmin.findUnique({
      where: { adminEmail: email },
    });

    return superAdmin;
  }

  async registerSuperAdmin(data: {
    adminName: string;
    adminEmail: string;
    password: string;
  }) {
    const { adminEmail, adminName, password } = data;

    if (!adminEmail || !adminName || !password)
      throw new BadRequestException('All fields are required');

    if (!this.emailRegex.test(adminEmail))
      throw new BadRequestException('Invalid email format');

    const existing = await this.findSuperAdminByEmail(adminEmail);
    if (existing) throw new BadRequestException('SuperAdmin already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newSuperAdmin = await this.prisma.superAdmin.create({
      data: {
        adminEmail,
        adminName,
        password: hashedPassword,
      },
    });

    return {
      message: 'SuperAdmin registered successfully',
      superAdminId: newSuperAdmin.id,
    };
  }

  async findSuperAdminByLogin(login: string) {
    const superAdmin = await this.prisma.superAdmin.findFirst({
      where: { OR: [{ adminEmail: login }, { phone: login }] },
    });

    if (!superAdmin) throw new UnauthorizedException('SuperAdmin not found');
    return superAdmin;
  }

  async superAdminLogin(data: { adminEmail: string; password: string }) {
    const { adminEmail, password } = data;
    const superAdmin = await this.findSuperAdminByLogin(adminEmail);

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password ?? '');
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Two-factor authentication
    if (superAdmin.is2FA) {
      const otp = await this.otpService.generateOTP(superAdmin.id);

      if (superAdmin.adminEmail === adminEmail) {
        await this.email.sendEmail(
          String(superAdmin.adminEmail),
          'Your OTP Code',
          'User-Otp-notification',
          {
            firstname: superAdmin.adminName,
            otp,
            validityMinutes: 5,
            companyName: 'Aby HR',
            year: new Date().getFullYear().toString(),
          },
        );
      }

      return {
        twoFARequired: true,
        message: `OTP sent to your email`,
        superAdminId: superAdmin.id,
      };
    }

    const token = this.jwtServices.sign({ id: superAdmin.id, role: 'superadmin' });
    return {
      token,
      twoFARequired: false,
      authenticated: true,
      message: 'Login successful',
    };
  }

  async verifyOTP(superAdminId: string, otp: string) {
    await this.otpService.verifyOTP(superAdminId, otp);
    const superAdmin = await this.prisma.superAdmin.findUnique({ where: { id: superAdminId } });
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');

    const token = this.jwtServices.sign({ id: superAdmin.id });
    return { token, superAdmin, message: 'Login successful', authenticated: true };
  }

  async changePassword(superAdminId: string, currentPassword: string, newPassword: string) {
    if (!superAdminId) throw new BadRequestException('SuperAdmin ID is required');
    if (!currentPassword || !newPassword)
      throw new BadRequestException('Both current and new password are required');
    if (newPassword.length < 6)
      throw new BadRequestException('New password must be at least 6 characters');

    const superAdmin = await this.findSuperAdminById(superAdminId);
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');
    if (!superAdmin.password)
      throw new UnauthorizedException('No password set for this account');

    const isMatch = await bcrypt.compare(currentPassword, superAdmin.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.superAdmin.update({
      where: { id: superAdminId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async lockSuperAdmin(id: string) {
    const superAdmin = await this.findSuperAdminById(id);
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');

    const locked = await this.prisma.superAdmin.update({
      where: { id },
      data: { isLocked: true },
    });
    return { message: `SuperAdmin ${locked.adminEmail} has been locked.` };
  }

  async unlockSuperAdmin(id: string, body: { password: string }) {
    if (!id) throw new BadRequestException('SuperAdmin ID is required');
    if (!body.password || body.password.length < 6)
      throw new BadRequestException('Password must be at least 6 characters long');

    const superAdmin = await this.findSuperAdminById(id);
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');
    if (!superAdmin.isLocked) throw new BadRequestException('SuperAdmin is not locked');

    const isPasswordValid = await bcrypt.compare(body.password, String(superAdmin.password));
    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    await this.prisma.superAdmin.update({
      where: { id },
      data: { isLocked: false },
    });
    return { message: 'SuperAdmin unlocked successfully' };
  }

  async updateSuperAdmin(
    id: string,
    data: {
      adminName?: string;
      adminEmail?: string;
      password?: string;
      profileImage?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    if (!id) throw new BadRequestException('SuperAdmin ID is required');

    const existing = await this.findSuperAdminById(id);
    if (!existing) throw new NotFoundException('SuperAdmin not found');

    if (data.adminEmail) {
      if (!this.emailRegex.test(data.adminEmail))
        throw new BadRequestException('Invalid email format');

      const emailExists = await this.prisma.superAdmin.findFirst({
        where: { adminEmail: data.adminEmail, NOT: { id } },
      });
      if (emailExists) throw new ConflictException('Email already taken');
    }

    const updatedSuperAdmin = await this.prisma.superAdmin.update({
      where: { id },
      data,
    });

    return { message: 'SuperAdmin updated successfully', superAdmin: updatedSuperAdmin };
  }

  async deleteSuperAdmin(id: string) {
    if (!id) throw new BadRequestException('SuperAdmin ID is required');

    const superAdmin = await this.findSuperAdminById(id);
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');

    await this.prisma.superAdmin.delete({ where: { id } });

    return { message: 'SuperAdmin deleted successfully' };
  }

  async logout(res: Response, superAdminId: string) {
    if (!superAdminId) throw new BadRequestException('SuperAdmin ID is required');

    const superAdmin = await this.findSuperAdminById(superAdminId);
    if (!superAdmin) throw new NotFoundException('SuperAdmin not found');

    if (superAdmin.isLocked) {
      await this.prisma.superAdmin.update({
        where: { id: superAdminId },
        data: { isLocked: false },
      });
    }

    res.clearCookie('AccessSuperAdminToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Logged out successfully' };
  }
}
