import {
  Body,
  Controller,
  Post,
  Res,
  Get,
  Req,
  UseGuards,
  HttpException,
  Patch,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { EmployeeAuthService } from './employee-auth.service';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleEmployeeStateGuard } from 'src/guards/google-employee-state.guard';


interface OAuthState {
  redirectUri?: string;
  popup?: boolean;
  [key: string]: any;
}


@Controller('employee')
export class EmployeeAuthController {
  constructor(private readonly employeeAuth: EmployeeAuthService) {}

  @Post('login')
  async login(
    @Body() body: { identifier: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const loginResult = await this.employeeAuth.employeeLogin(body);

      if (loginResult.twoFARequired) {
        return res.status(200).json(loginResult);
      }

     res.cookie('AccessEmployeeToken', loginResult.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only secure in production
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // ensure path matches when clearing
});


      return res.status(200).json(loginResult);
    } catch (error: any) {
      throw new HttpException(error.message || 'Login failed', 400);
    }
  }

  @Post('verify-otp')
  async verifyOTP(
    @Body() body: { employeeId: string; otp: string },
    @Res() res: Response,
  ) {
    try {
      const verifyResult = await this.employeeAuth.verifyOTP(
        body.employeeId,
        body.otp,
      );

     res.cookie('AccessEmployeeToken', verifyResult.token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only secure in production
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // ensure path matches when clearing
});


      return res.status(200).json(verifyResult);
    } catch (error: any) {
      throw new HttpException(error.message || 'OTP verification failed', 400);
    }
  }


  @Patch('change-password')
  @UseGuards(EmployeeJwtAuthGuard)
  async changePassword(
    @Req() req: RequestWithEmployee,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.employeeAuth.changePassword(
      req.employee.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Get('google')
  @UseGuards(GoogleEmployeeStateGuard, AuthGuard('google-employee'))
  googleAuth(@Query('state') state: string) {
    // Guard handles storing state in cookie before OAuth redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google-employee'))
  googleRedirect(@Req() req, @Res() res: Response) {
    try {
      const { token, redirect, state: passedState } = req.user;

      // Prefer state from strategy, fallback to cookie
      const state = passedState || req.cookies?.oauth_state;

      // Clear oauth state cookie
      res.clearCookie('oauth_state', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      let parsedState: OAuthState = {};
      if (state) {
        try {
          parsedState =
            typeof state === 'string'
              ? JSON.parse(decodeURIComponent(state))
              : state;
        } catch (e) {
          console.error('Failed to parse state:', e);
        }
      }

      const redirectUri = parsedState.redirectUri;
      const isPopup = !!parsedState.popup;

      // If strategy explicitly returned redirect (e.g. notfound)
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

      // If no token
      if (!token) {
        const redirectPath =
          redirectUri ||
          `${process.env.FRONTEND_URL_ONLY}/employee/login`;
        if (isPopup) {
          return res.send(`
            <script>
              window.opener.postMessage({ redirect: '${redirectPath}' }, '*');
              window.close();
            </script>
          `);
        }
        return res.redirect(redirectPath);
      }

      // Set cookie
     res.cookie('AccessEmployeeToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // only secure in production
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/', // ensure path matches when clearing
});


      // Handle dynamic redirect
      if (redirectUri) {
        if (isPopup) {
          return res.send(`
            <script>
              window.opener.postMessage({ token: '${token}', redirect: '${redirectUri}' }, '*');
              window.close();
            </script>
          `);
        }
        return res.redirect(redirectUri);
      }

      // Default redirect
      if (isPopup) {
        return res.send(`
          <script>
            window.opener.postMessage({ token: '${token}', redirect: '${process.env.FRONTEND_URL_ONLY}/employee/dashboard' }, '*');
            window.close();
          </script>
        `);
      }

      return res.redirect(`${process.env.FRONTEND_URL_ONLY}/employee/dashboard`);
    } catch (error) {
      console.error('Google employee callback error', error);
      res.clearCookie('oauth_state');
      return res.redirect(`${process.env.FRONTEND_URL_ONLY}/employee/login`);
    }
  }

  @Post('logout')
  @UseGuards(EmployeeJwtAuthGuard)
   logout(@Res() res: Response) {


  res.clearCookie('AccessEmployeeToken', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/', // <-- very important
});
   return res.json({ message: 'Logged out successfully' });
  }

  @Post('lock')
@UseGuards(EmployeeJwtAuthGuard)
async lockEmployee(@Req() req: RequestWithEmployee) {
  const employeeId = req.employee?.id as string;
  if (!employeeId) {
    throw new Error('Employee ID not found in request');
  }
  try {
    return await this.employeeAuth.lockEmployee(employeeId);
  } catch (error) {
    console.log('Error locking employee', error);
    throw new HttpException(error.message, error.status);
  }
}

@Post('unlock')
@UseGuards(EmployeeJwtAuthGuard)
async unlockEmployee(
  @Req() req: RequestWithEmployee,
  @Body() body: { password: string },
) {
  const employeeId = req.employee?.id as string;
  if (!employeeId) {
    throw new Error('Employee ID not found in request');
  }
  try {
    return await this.employeeAuth.unlockEmployee(employeeId, body);
  } catch (error) {
    console.log('Error unlocking employee', error);
    throw new HttpException(error.message, error.status);
  }
}

@Get('profile')
@UseGuards(EmployeeJwtAuthGuard)
async getCurrentEmployee(@Req() req: RequestWithEmployee) {
  const employeeId = req.employee?.id;
  if (!employeeId) throw new NotFoundException('Employee ID not found in token');

  const employee = await this.employeeAuth.findOne(employeeId); // fetch from DB
  if (!employee) throw new NotFoundException('Employee not found');

  return  employee
}

}
