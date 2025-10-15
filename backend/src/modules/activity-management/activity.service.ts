import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  create(data: any, adminId: string) {   // 👈 change to string
    return this.prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        adminId, // already string
      },
    });
  }

  findAll() {
    return this.prisma.activity.findMany({
      include: { admin: true },
    });
  }

  findOne(id: number) {
    return this.prisma.activity.findUnique({
      where: { id },
      include: { admin: true },
    });
  }

  update(id: number, data: any, adminId: string) {  // 👈 change to string
    return this.prisma.activity.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        adminId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.activity.delete({ where: { id } });
  }
}
