// src/admin/otp.service.ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { randomInt } from 'crypto';

@Injectable()
export class OTPService {
  constructor(@Inject('REDIS') private readonly redis: RedisClientType) {}

  async generateOTP(adminId: string): Promise<string> {
    const otp = randomInt(100000, 999999).toString();
    await this.redis.set(`admin_otp_${adminId}`, otp, { EX: 300 }); // expires in 5 min
    return otp;
  }

  async verifyOTP(adminId: string, code: string) {
    const stored = await this.redis.get(`admin_otp_${adminId}`);
    if (!stored) throw new UnauthorizedException('OTP expired or invalid');
    if (stored !== code) throw new UnauthorizedException('Invalid OTP');
    await this.redis.del(`admin_otp_${adminId}`);
    return true;
  }
}
