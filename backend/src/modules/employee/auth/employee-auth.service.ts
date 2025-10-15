import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { OTPService } from 'src/global/otp/otp.service';
import { EmailService } from 'src/global/email/email.service';
import { EmployeeService } from '../employee.service';


@Injectable()
export class EmployeeAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private email: EmailService,
    private employeeService: EmployeeService,
  ) {}

  async findEmployeeByEmailOrPhone(identifier: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });

    if (!employee) throw new UnauthorizedException('Employee not found');
    return employee;
  }

  async employeeLogin(data: { identifier: string; password: string }) {
    const { identifier, password } = data;

    const employee = await this.findEmployeeByEmailOrPhone(identifier);

    const isPasswordValid = await bcrypt.compare(
      password,
      employee.password ?? '',
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    if (employee.is2FA) {
      const otp = await this.otpService.generateOTP(employee.id);

      await this.email.sendEmail(
        employee.email,
        'Your Employee OTP Code',
        'User-Otp-notification',
        {
          firstname: employee.first_name,
          otp,
          validityMinutes: 5,
          companyName: 'Aby HR',
          year: new Date().getFullYear().toString(),
        },
      );

      return {
        twoFARequired: true,
        message: 'OTP sent to your email',
        employeeId: employee.id,
      };
    }

    const token = this.jwtService.sign({
      id: employee.id,
      role: 'employee',
    });

    return { token, twoFARequired: false, authenticated: true };
  }

  async verifyOTP(employeeId: string, otp: string) {
    await this.otpService.verifyOTP(employeeId, otp);

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const token = this.jwtService.sign({
      id: employee.id,
      role: 'employee',
    });

    return { token, employee,authenticated:true, message: 'Login successful' };
  }

  async changePassword(
    employeeId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const isMatch = await bcrypt.compare(
      currentPassword,
      employee.password ?? '',
    );
    if (!isMatch)
      throw new UnauthorizedException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  // Lock employee account
async lockEmployee(id: string) {
  try {
    const employee = await this.employeeService.findOne(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    const lockedEmployee = await this.prisma.employee.update({
      where: { id },
      data: { isLocked: true },
    });
    return { message: `Employee ${lockedEmployee.email} has been locked.` };
  } catch (error) {
    console.error('Error locking employee', error);
    throw new Error(error.message);
  }
}

// Unlock employee account
async unlockEmployee(id: string, body: { password: string }) {
  try {
    if (!id) {
      throw new BadRequestException('Employee id is required');
    }
    if (!body.password || body.password.length < 6) {
      throw new BadRequestException(
        'Password is required and must be at least 6 characters long',
      );
    }

    const employee = await this.employeeService.findOne(id);
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }
    if (!employee.isLocked) {
      throw new BadRequestException('Employee is not locked');
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      String(employee.password),
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    await this.prisma.employee.update({
      where: { id },
      data: { isLocked: false },
    });

    return { message: 'Employee unlocked successfully' };
  } catch (error) {
    console.error('Error unlocking employee:', error);
    throw new Error(error.message);
  }
}


 async findOne(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    return employee;
  }

}
