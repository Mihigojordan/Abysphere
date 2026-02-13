import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/global/email/email.service';
import { generatePassword } from 'src/common/utils/GeneratePassword.utils';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async create(data: any, adminId: string) {
    try {
      const { id, ...clientData } = data;

      // Generate password for the client
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdClient = await this.prisma.client.create({
        data: {
          ...clientData,
          status: 'ACTIVE',
          adminId,
        },
      });

      // Get admin (company) info for the email
      const admin = await this.prisma.admin.findUnique({
        where: { id: adminId },
      });

      // Send welcome email to the client
      const currentYear = new Date().getFullYear();
      const loginUrl = process.env.FRONTEND_URL || 'https://app.mysystem.rw';

      if (createdClient.email) {
        await this.email.sendEmail(
          createdClient.email,
          'Welcome to MySystem – Your Account is Ready',
          'Client-Account-Created',
          {
            clientName: `${createdClient.firstname || ''} ${createdClient.lastname || ''}`.trim() || 'Valued Client',
            loginUrl: loginUrl,
            email: createdClient.email,
            password: password,
            year: currentYear,
          },
        );
      }

      return createdClient;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create client');
    }
  }

  async findAll(adminId: string) {
    try {
      return await this.prisma.client.findMany({ where: { adminId } });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch clients');
    }
  }

  async findOne(id: string, adminId: string) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id, adminId },
      });
      if (!client) throw new NotFoundException('Client not found');
      return client;
    } catch (error) {
      console.error(error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch client');
    }
  }

  async update(id: string, data: any) {
    try {
      console.log(data);

      return await this.prisma.client.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.client.delete({ where: { id } });
      return { message: 'Client deleted successfully' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete client');
    }
  }
}
