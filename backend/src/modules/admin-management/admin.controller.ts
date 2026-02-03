import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminFileFields, AdminUploadConfig } from 'src/common/utils/file-upload.utils';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAdminStateGuard } from 'src/guards/google-admin-state.guard';

interface OAuthState {
  redirectUri?: string;
  popup?: boolean;
  [key: string]: any;
}


@Controller('admin')
export class AdminController {
  constructor(private readonly adminServices: AdminService) { }

  @Post('register')
  async registerByClient(@Body() req) {
    try {
      return await this.adminServices.registerAdmin(req);
    } catch (error) {
      console.log('error registering admin', error);
      throw new HttpException(error.message, error.status);
    }
  }

  /**
   * Login endpoint
   * @body { adminEmail: string, password: string }
   */
  @Post('login')
  async login(@Body() body: { adminEmail: string; password: string }, @Res() res: Response) {
    try {
      const loginResult = await this.adminServices.adminLogin(body);

      // If 2FA required, return without JWT
      if (loginResult.twoFARequired) {
        return res.status(200).json(loginResult);
      }

      // If 2FA not required, set cookie with JWT
      res.cookie('AccessAdminToken', loginResult.token, {
        httpOnly: true,
        secure: true, // Set true in production
        sameSite: 'none', // Required for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json(loginResult);
    } catch (error: any) {
      throw new HttpException(error.message || 'Login failed', error.status || 400);
    }
  }


  /**
  * Verify OTP endpoint
  * @body { adminId: string, otp: string }
  */
  @Post('verify-otp')
  async verifyOTP(
    @Body() body: { adminId: string; otp: string },
    @Res() res: Response,
  ) {
    try {
      const verifyResult = await this.adminServices.verifyOTP(body.adminId, body.otp);

      // Set JWT cookie after successful OTP verification
      res.cookie('AccessAdminToken', verifyResult.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json(verifyResult);
    } catch (error: any) {
      throw new HttpException(error.message || 'OTP verification failed', error.status || 400);
    }
  }



  @Get('google')
  @UseGuards(GoogleAdminStateGuard, AuthGuard('google-admin'))
  googleAuth(@Query('state') state: string) {
    // This won't run, but that's okay - the guard handles it
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google-admin'))
  googleRedirect(@Req() req, @Res() res: Response) {
    try {
      const { token, redirect, state: passedState } = req.user;

      // Use state from strategy or fallback to cookie
      const state = passedState || req.cookies?.oauth_state;




      // Clear the oauth state cookie
      res.clearCookie('oauth_state', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

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

      const redirectUri = parsedState.redirectUri;
      const isPopup = !!parsedState.popup;

      // Strategy redirect (like notfound)
      if (redirect) {
        if (isPopup) {
          return res.send(`
          <script>
            window.opener.postMessage({ redirect: '${redirect}' }, '*');
            window.close();
          </script>
        `);
        }
        return res.redirect(redirect);
      }

      if (!token) {
        const redirect = redirectUri ? redirectUri : `${process.env.FRONTEND_URL_ONLY}/admin/login`
        if (isPopup) {
          return res.send(`
          <script>
            window.opener.postMessage({ redirect: '${redirect}' }, '*');
            window.close();
          </script>
        `);
        }
        return res.redirect(redirect);
      }




      res.cookie('AccessAdminToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });







      // Dynamic redirect from state
      if (redirectUri) {
        if (isPopup) {
          return res.send(`
          <script>
            window.opener.postMessage({ token: '${token}', redirect: '${redirectUri}' }, '*');
            window.close();
          </script>
        `);
        }
        return res.redirect(`${redirectUri}`);
      }



      if (isPopup) {
        return res.send(`
        <script>
          window.opener.postMessage({ token: '${token}', redirect: '${process.env.FRONTEND_URL_ONLY}/admin/dashboard' }, '*');
          window.close();
        </script>
      `);
      }

      return res.redirect(`${process.env.FRONTEND_URL_ONLY}/admin/dashboard`);
    } catch (error) {
      console.error('Google callback error', error);
      // Clear cookie on error too
      res.clearCookie('oauth_state');
      return res.redirect(`${process.env.FRONTEND_URL_ONLY}/admin/login`);
    }
  }





  @Post('logout')
  @UseGuards(AdminJwtAuthGuard)
  async logoutByHost(
    @Res({ passthrough: true }) res: Response,
    @Req() req: RequestWithAdmin,
  ) {
    const adminId = req.admin?.id as string;
    try {
      return await this.adminServices.logout(res, adminId);
    } catch (error) {
      console.error('Error logging out client:', error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('profile')
  @UseGuards(AdminJwtAuthGuard)
  async getAdminProfile(@Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id as string;
    try {
      const admin = await this.adminServices.findAdminById(adminId);

      if (!admin) {
        throw new HttpException('Admin not found', 404);
      }
      return {
        admin,
        authenticated: true,
      }
    } catch (error) {
      console.error('Error logging out admin:', error);
      throw new HttpException(error.message, error.status);
    }
  }


  @Patch('change-password')
  @UseGuards(AdminJwtAuthGuard) // make sure only logged-in admins can call this
  async changePassword(
    @Req() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const adminId = req.admin.id as string; // from JWT
    return this.adminServices.changePassword(
      adminId,
      body.currentPassword,
      body.newPassword,
    );
  }

  //this profile is for locking host account
  @Post('lock')
  @UseGuards(AdminJwtAuthGuard)
  async HostLocking(@Req() req: RequestWithAdmin) {
    const adminId = req.admin?.id as string;
    if (!adminId) {
      throw new Error('Host ID not found in request');
    }
    try {
      return await this.adminServices.lockAdmin(adminId);
    } catch (error) {
      console.log('error locking admin', error);
      throw new HttpException(error.message, error.status);
    }
  }

  //this endpoint is for host to unlock his account
  @Post('unlock')
  @UseGuards(AdminJwtAuthGuard)
  async adminUnlocking(@Req() req: RequestWithAdmin, @Body() datas) {
    const adminId = req.admin?.id as string;
    if (!adminId) {
      throw new Error('Host ID not found in request');
    }
    try {
      return await this.adminServices.adminUnlocking(adminId, datas);
    } catch (error) {
      console.log('error editing host', error);
      throw new HttpException(error.message, error.status);
    }
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor(AdminFileFields, AdminUploadConfig),
  )
  async updateAdmin(
    @Param('id') id: string,
    @UploadedFiles() files: { profileImg?: Express.Multer.File[] },
    @Body()
    body: {
      adminName?: string;
      adminEmail?: string;
      password?: string;

      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) {

    function parseBoolean(value: string | boolean | undefined): boolean | undefined {
      if (typeof value === 'string') return JSON.parse(value);
      return value;
    }
    if (files?.profileImg?.[0]?.filename) {
      body['profileImage'] = `/uploads/profile_images/${files.profileImg[0].filename}`;
    }
    if (body['is2FA']) {
      body['is2FA'] = parseBoolean(body['is2FA'])
    }
    return this.adminServices.updateAdmin(id, body);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string) {
    return this.adminServices.deleteAdmin(id);
  }
}


