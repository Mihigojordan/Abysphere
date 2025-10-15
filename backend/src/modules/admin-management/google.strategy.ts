// google-admin.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

interface OAuthState {
  redirectUri?: string;
  popup?: boolean;
  [key: string]: any;
}


@Injectable()
export class GoogleAdminStrategy extends PassportStrategy(
  Strategy,
  'google-admin',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: process.env.ADMIN_CLIENT_ID,
      clientSecret: process.env.ADMIN_CLIENT_SECRET,
      callbackURL: process.env.ADMIN_CALLBACK_URL,
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
    },
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id, emails } = profile;
      const userEmail = emails[0].value;
      console.log(id);
      console.log('profile email:', profile);
      
      
      // Get state from cookies
      const state = req.cookies?.oauth_state;
      console.log("State received from cookie:", state);
      console.log("All cookies:", req.cookies);

      let parsedState: OAuthState = {};
    
    if (state) {
      try {
        parsedState = typeof state === 'string' ? JSON.parse(decodeURIComponent(state)) : state;
        console.log('Parsed state:', parsedState);
    } catch (e) {
        console.error('Failed to parse state:', e);
        parsedState = {};
      }
    }

    if(!id){
        console.log('shit');
        console.log(parsedState.redirectUri);
        
        const url = parsedState.redirectUri ? `${parsedState.redirectUri}&&status=notfound&&acceptance=0` :  `${process.env.FRONTEND_URL_ONLY}/auth/admin/login?status=notfound&&acceptance=0`
        
      return done(null, { redirect: url , state });
    }
      let admin = await this.prisma.admin.findUnique({
        where: { google_id: id },
      });

      if (admin) {
        const token = this.jwtService.sign({ id: admin.id, role: 'admin' });
        return done(null, { admin, token, state });
      }

      admin = await this.prisma.admin.findUnique({
        where: { adminEmail: userEmail },
      });



      if (!admin) {
         const url = parsedState.redirectUri ? `${parsedState.redirectUri}&&status=notfound&&acceptance=0` :   `${process.env.FRONTEND_URL_ONLY}/auth/admin/login?status=notfound&&acceptance=0`
        return done(null, {
          redirect: url,
          state,
        });
      }

      if (!admin.google_id) {
        admin = await this.prisma.admin.update({
          where: { id: admin.id },
          data: { google_id: id },
        });
      }

      const token = this.jwtService.sign({ id: admin.id, role: 'admin' });
      return done(null, { admin, token, state });
    } catch (error) {
      console.error('Google Admin Strategy Error:', error);
      done(error, null);
    }
  }
}