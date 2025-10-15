import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

interface OAuthState {
  redirectUri?: string;
  popup?: boolean;
  [key: string]: any;
}

@Injectable()
export class GoogleEmployeeStrategy extends PassportStrategy(
  Strategy,
  'google-employee',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: process.env.EMPLOYEE_CLIENT_ID,
      clientSecret: process.env.EMPLOYEE_CLIENT_SECRET,
      callbackURL: process.env.EMPLOYEE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: {
      id: string;
      emails: { value: string }[];
      name?: { givenName?: string; familyName?: string };
    },
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails, name } = profile;
      const userEmail = emails?.[0]?.value;

      // Get state from cookies
      const state = req.cookies?.oauth_state;
      let parsedState: OAuthState = {};
      if (state) {
        try {
          parsedState =
            typeof state === 'string'
              ? JSON.parse(decodeURIComponent(state))
              : state;
        } catch (e) {
          console.error('Failed to parse state:', e);
          parsedState = {};
        }
      }

      if (!id || !userEmail) {
        const url = parsedState.redirectUri
          ? `${parsedState.redirectUri}&&status=notfound&&acceptance=0`
          : `${process.env.FRONTEND_URL_ONLY}/auth/employee/login?status=notfound&&acceptance=0`;

        return done(null, { redirect: url, state });
      }

      // Try to find employee by Google ID
      let employee = await this.prisma.employee.findUnique({
        where: { google_id: id },
      });

      if (employee) {
        const token = this.jwtService.sign({ id: employee.id, role: 'employee' });
        return done(null, { employee, token, state });
      }

      // Try to find employee by email
      employee = await this.prisma.employee.findUnique({
        where: { email: userEmail },
      });

      if (!employee) {
        const url = parsedState.redirectUri
          ? `${parsedState.redirectUri}&&status=notfound&&acceptance=0`
          : `${process.env.FRONTEND_URL_ONLY}/auth/employee/login?status=notfound&&acceptance=0`;

        return done(null, { redirect: url, state });
      }

      // Link existing employee to Google account if not already linked
      if (!employee.google_id) {
        employee = await this.prisma.employee.update({
          where: { id: employee.id },
          data: {
            google_id: id,
            first_name: employee.first_name || name?.givenName || '',
            last_name: employee.last_name || name?.familyName || '',
          },
        });
      }

      const token = this.jwtService.sign({ id: employee.id, role: 'employee' });
      return done(null, { employee, token, state });
    } catch (error) {
      console.error('Google Employee Strategy Error:', error);
      done(error, null);
    }
  }
}
