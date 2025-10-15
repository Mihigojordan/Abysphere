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
export class AdminService {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtServices: JwtService,
    private readonly otpService: OTPService,
    private readonly email: EmailService,
  ) { }

  async findAdminById(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('admin id is required');
      }
      const admin = await this.prisma.admin.findUnique({
        where: {
          id: id,
        },
      });
      return admin;
    } catch (error) {
      console.error('error finding admin', error);
      throw new Error(error.message);
    }
  }

  async findAdminByEmail(email: string) {
    try {
      if (!email) {
        throw new BadRequestException('admin id is required');
      }
      const admin = await this.prisma.admin.findUnique({
        where: {
          adminEmail: email,
        },
      });

      return admin;
    } catch (error) {
      console.error('error finding admin', error);
      throw new Error(error.message);
    }
  }

  async registerAdmin(data: {
    adminName: string;
    adminEmail: string;
    password: string;
  }) {
    try {
      const { adminEmail, adminName, password } = data;

      if (!adminEmail || !adminName || !password) {
        throw new BadRequestException('all input are required');
      }

      if (!this.emailRegex.test(adminEmail)) {
        throw new BadRequestException('Invalid email format');
      }
      const existing = await this.findAdminByEmail(adminEmail);
      if (existing) {
        throw new BadRequestException('Admin already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newAdmin = await this.prisma.admin.create({
        data: {
          adminEmail: adminEmail,
          adminName: adminName,
          password: hashedPassword,
        },
      });

      return { message: 'Admin registered successfully', adminId: newAdmin.id };
    } catch (error) {
      console.error('error finding admin', error);
      throw new Error(error.message);
    }
  }

  async findAdminByLogin(login: string) {
    const admin = await this.prisma.admin.findFirst({
      where: { OR: [{ adminEmail: login }, { phone: login }] },
    });
    if (!admin) throw new UnauthorizedException('Admin not found');
    return admin;
  }
  async adminLogin(data: { adminEmail: string; password: string }) {
    const { adminEmail, password } = data;
    const admin = await this.findAdminByLogin(adminEmail);

    const isPasswordValid = await bcrypt.compare(password, admin.password ?? '');
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    // Step 2: Check if 2FA is enabled
    if (admin.is2FA) {
      const otp = await this.otpService.generateOTP(admin.id);

      // Send OTP to the correct channel
      if (admin.adminEmail === adminEmail) {
        await this.email.sendEmail(
          String(admin.adminEmail),
          'Your OTP Code',
          'User-Otp-notification',
          {
            firstname: admin.adminName,
            otp: otp, // e.g., 6-digit code
            validityMinutes: 5, // optional, e.g., 10 minutes
            companyName: 'Aby HR',
            year: new Date().getFullYear().toString(),
          }
        );

        ;
      }
      //  else if (admin.phone === identifier) {
      //   await this.otpService.sendOTPSMS(admin.phone, otp);
      // }

      return {
        twoFARequired: true,
        message: `OTP sent to your ${admin.adminEmail === adminEmail ? 'email' : 'phone'}`,
        adminId: admin.id,
      };
    }

    // Step 3: If 2FA is disabled, return JWT immediately
    const token = this.jwtServices.sign({ id: admin.id, role: 'admin' });
    return { token, twoFARequired: false, authenticated: true, message: 'Login successful' };
  }

  async verifyOTP(adminId: string, otp: string) {
    await this.otpService.verifyOTP(adminId, otp);
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId }, });
    if (!admin) throw new NotFoundException('Admin not found');

    const token = this.jwtServices.sign({ id: admin.id });
    return { token, admin, message: 'Login successful', authenticated: true };
  }


  // change password
  async changePassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    if (!adminId) throw new BadRequestException('Admin ID is required');
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Both current and new password are required');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    // Find admin
    const admin = await this.findAdminById(adminId);
    if (!admin) throw new NotFoundException('Admin not found');
    if (!admin.password) throw new UnauthorizedException('No password set for this account');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }


  async lockAdmin(id: string) {
    try {
      const admin = await this.findAdminById(id);
      if (!admin) {
        throw new NotFoundException('admin not found');
      }
      const adminLocked = await this.prisma.admin.update({
        where: { id },
        data: { isLocked: true },
      });
      return { message: `Admin ${adminLocked.adminEmail} has been locked.` };
    } catch (error) {
      console.error('error finding admin', error);
      throw new Error(error.message);
    }
  }

  // functiom for unlocking admin
  async adminUnlocking(id: string, body: { password: string }) {
    try {
      // validate the hostId
      if (!id) {
        throw new BadRequestException('admin id is required');
      }
      // check and validate the password
      if (!body.password || body.password.length < 6) {
        throw new BadRequestException(
          'password is required and must be at least 6 characters long',
        );
      }
      // check if the host exists
      const admin = await this.findAdminById(id);
      // if the host does not exist, throw an error
      if (!admin) {
        throw new BadRequestException('admin not found');
      }
      // if the host is not locked, throw an error
      if (!admin.isLocked) {
        throw new BadRequestException('admin is not locked');
      }
      // compare the password with the hashed password
      const isPasswordValid = await bcrypt.compare(
        body.password,
        String(admin.password),
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }
      // unlock the host
      const unlockedAdmin = await this.prisma.admin.update({
        where: { id: id },
        data: { isLocked: false },
      });
      return {
        message: 'host unlocked successfully',
      };
    } catch (error) {
      console.error('Error unlocking host:', error);
      throw new Error(error.message);
    }
  }


  // admin.service.ts
  async updateAdmin(
    id: string,
    data: {
      adminName?: string;
      adminEmail?: string;
      password?: string;
      profileImage?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {
    try {
      if (!id) throw new BadRequestException('Admin ID is required');

      const existing = await this.findAdminById(id);
      if (!existing) throw new NotFoundException('Admin not found');

      // Prevent duplicate email
      if (data.adminEmail) {
        if (!this.emailRegex.test(data.adminEmail)) {
          throw new BadRequestException('Invalid email format');
        }
        const emailExists = await this.prisma.admin.findFirst({
          where: { adminEmail: data.adminEmail, NOT: { id } },
        });
        if (emailExists) throw new ConflictException('Email already taken');
      }

      // Hash password if provided

      const updatedAdmin = await this.prisma.admin.update({
        where: { id },
        data,
      });

      return {
        message: 'Admin updated successfully',
        admin: updatedAdmin,
      };
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error(error.message);
    }
  }

  async deleteAdmin(id: string) {
    try {
      if (!id) throw new BadRequestException('Admin ID is required');

      const admin = await this.findAdminById(id);
      if (!admin) throw new NotFoundException('Admin not found');

      await this.prisma.admin.delete({ where: { id } });

      return { message: 'Admin deleted successfully' };
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw new Error(error.message);
    }
  }



  async logout(res: Response, adminId: string) {
    try {
      if (!adminId) {
        throw new BadRequestException('admin id is required');
      }
      const admin = await this.findAdminById(adminId);
      if (!admin) {
        throw new NotFoundException('admin not found');
      }

      if (admin.isLocked) {
        await this.prisma.admin.update({
          where: {
            id: adminId,
          },
          data: {
            isLocked: false,
          },
        });
      }

      res.clearCookie('AccessAdminToken', {
        httpOnly: true,
        secure: true, // <-- Required for SameSite=None in production
        sameSite: 'none', // <-- Required for cross-origin cookies
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return { message: 'logged out successfully' };
    } catch (error) {
      console.log('error logging out:', error);
      throw new Error(error.message);
    }

  }

}
