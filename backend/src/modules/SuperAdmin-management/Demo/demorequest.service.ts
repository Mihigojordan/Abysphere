import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DemoRequestService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.demoRequest.create({ data });
  }

  findAll() {
    return this.prisma.demoRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.demoRequest.findUnique({ where: { id } });
  }

  update(id: number, data: any) {
    return this.prisma.demoRequest.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.demoRequest.delete({ where: { id } });
  }
}
