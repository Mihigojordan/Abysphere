import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MembershipPlanService {
  constructor(private prisma: PrismaService) {}

async create(data: any) {
  return this.prisma.membershipPlan.create({
    data: {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      expireTime: new Date(data.expireTime).toISOString(),
    },
    include: {
      company: {
        select: { adminName: true },
      },
    },
  });
}


  async findAll() {
    return this.prisma.membershipPlan.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { adminName: true } } },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

async update(id: string, data: any) {
  await this.findOne(id);

  const formattedData: any = {
    planName: data.planName,
    amountPaid: data.amountPaid,
    shortDescription: data.shortDescription,
    ...(data.startTime && { startTime: new Date(data.startTime) }),
    ...(data.expireTime && { expireTime: new Date(data.expireTime) }),
    ...(data.companyId && {
      company: { connect: { id: data.companyId } },
    }),
  };

  return this.prisma.membershipPlan.update({
    where: { id },
    data: formattedData,
    include: { company: { select: { adminName: true } } },
  });
}



  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.membershipPlan.delete({ where: { id } });
  }
}
