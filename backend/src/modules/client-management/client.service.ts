import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      const { id, ...clientData } = data;
      return await this.prisma.client.create({ data: {...clientData,status:'ACTIVE'} });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create client');
    }
  }

  async findAll() {
    try {
      return await this.prisma.client.findMany();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to fetch clients');
    }
  }

  async findOne(id: string) {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
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
