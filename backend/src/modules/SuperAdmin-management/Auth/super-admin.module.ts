import { Module } from '@nestjs/common';
import { AdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { JwtModule } from '@nestjs/jwt';
import { OTPService } from 'src/global/otp/otp.service';
import { EmailModule } from 'src/global/email/email.module';

import { GoogleAdminStrategy } from './super-google.strategy';

@Module({
  controllers: [AdminController,],
  providers: [SuperAdminService,OTPService,GoogleAdminStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY,
      global: true,
      signOptions: {
        expiresIn: "7d"
      }
    }),

    EmailModule,
  ]
})
export class SuperAdminModule {}
