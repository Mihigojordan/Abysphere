import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'body-parser';

import * as express from 'express';
import { join, basename, extname } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // IMPORTANT: must be before guards/controllers use req.cookies
  app.use(cookieParser());

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // ✅ CORS: allow ONLY your frontend (and localhost for dev)
  app.enableCors({
    origin: [
      'https://system.izubagen.rw',
      'https://www.system.izubagen.rw',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'X-HTTP-Method-Override',
      'Range', // ✅ important for PDFs/media
    ],
    exposedHeaders: [
      'Content-Disposition',
      'Content-Length',
      'Content-Range',
    ],
    optionsSuccessStatus: 204,
  });

  // ✅ Static serving
  // IMPORTANT: do NOT set Access-Control-Allow-* here (let enableCors handle it)
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads'), {
      setHeaders: (res, filePath) => {
        const fileName = basename(filePath);
        const ext = extname(filePath).toLowerCase();

        // Content-Type mapping
        let contentType = 'application/octet-stream';
        switch (ext) {
          case '.pdf':
            contentType = 'application/pdf';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
          case '.webp':
            contentType = 'image/webp';
            break;
          case '.gif':
            contentType = 'image/gif';
            break;
          case '.txt':
            contentType = 'text/plain';
            break;
          case '.doc':
            contentType = 'application/msword';
            break;
          case '.docx':
            contentType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        }

        // If you want browser preview for PDFs/images, use inline:
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        res.setHeader('Content-Type', contentType);

        // Cache and security headers (keep these if you want)
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        res.setHeader(
          'Content-Security-Policy',
          "default-src 'self' data:; img-src 'self' data:; style-src 'self' 'unsafe-inline';",
        );
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        // Helps cross-origin loading of images/docs
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
