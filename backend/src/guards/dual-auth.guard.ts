import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface RequestWithAdminEmployee extends Request {
  admin?: any;
  employee?: any;
}

@Injectable()
export class DualAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest<RequestWithAdminEmployee>();

    const adminToken = request.cookies?.['AccessAdminToken'];
    const employeeToken = request.cookies?.['AccessEmployeeToken'];

    // 1️⃣ Check Admin token
    if (adminToken) {
      try {
        const decodedAdmin = await this.jwtService.verifyAsync(adminToken, {
          secret: process.env.JWT_SECRET || 'secretkey',
        });

        request.admin = decodedAdmin;
        return true;
      } catch (error) {
        console.log('Invalid admin token:', error);
      }
    }

    // 2️⃣ Check Employee token
    if (employeeToken) {
      try {
        const decodedEmployee = await this.jwtService.verifyAsync(
          employeeToken,
          {
            secret: process.env.JWT_SECRET || 'secretkey',
          },
        );

        request.employee = decodedEmployee;
        return true;
      } catch (error) {
        console.log('Invalid employee token:', error);
      }
    }

    // 3️⃣ If neither token is valid
    throw new UnauthorizedException(
      'You do not have permission to access this resource',
    );
  }
}
