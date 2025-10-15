import { Module } from '@nestjs/common';
import { EmployeeAuthService } from './employee-auth.service';
import { EmployeeAuthController } from './employee-auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from 'src/global/email/email.service';
import { OTPService } from 'src/global/otp/otp.service';
import { GoogleEmployeeStrategy } from './employee-google.strategy';
import { EmployeeService } from '../employee.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY || 'secretkey', // 👈 Use same secret as Admin
      signOptions: { expiresIn: '7d' }, // JWT lifetime
    }),
  ],
  controllers: [EmployeeAuthController],
  providers: [EmployeeAuthService, EmployeeService, PrismaService, EmailService, OTPService,GoogleEmployeeStrategy],
  exports: [EmployeeAuthService],
})
export class EmployeeAuthModule {}
