import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME!,
      pass: process.env.SMTP_PASSWORD!,
    },
    tls: {
      rejectUnauthorized: false, // NOTE: enable true in real production if possible
    },
  });

  private getTemplatesBaseDir(): string {
    // In prod you run: node dist/main
    // So templates must be available under dist (copied there during build)
    const root = process.env.NODE_ENV === 'production' ? 'dist' : 'src';
    return path.join(process.cwd(), root, 'Templates');
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    if (!to || !subject || !templateName) {
      throw new BadRequestException(
        'Email recipient, subject and template are required.',
      );
    }

    const templatesDir = this.getTemplatesBaseDir();
    const templatePath = path.join(templatesDir, `${templateName}.hbs`);

    this.logger.log(`Using templates dir: ${templatesDir}`);

    if (!fs.existsSync(templatePath)) {
      this.logger.error(
        `Email template "${templateName}" not found at ${templatePath}`,
      );
      throw new BadRequestException('Email template not found');
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateContent);
    const html = template(templateData);

    try {
      await this.transporter.sendMail({
        from: `MY SYSTEM <${process.env.SMTP_USERNAME}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error: any) {
      this.logger.error('Failed to send email', error?.stack || error);
      throw new Error('Email sending failed');
    }
  }
}
