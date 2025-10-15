import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtModule } from '@nestjs/jwt';
import { OTPService } from 'src/global/otp/otp.service';
import { EmailModule } from 'src/global/email/email.module';
import { RedisModule } from 'src/global/redis/redis.module';
import { GoogleAdminStrategy } from './google.strategy';

@Module({
  controllers: [AdminController,],
  providers: [AdminService,OTPService,GoogleAdminStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.Jwt_SECRET_KEY,
      global: true,
      signOptions: {
        expiresIn: "7d"
      }
    }),
    RedisModule,
    EmailModule,
  ]
})
export class AdminModule {}
