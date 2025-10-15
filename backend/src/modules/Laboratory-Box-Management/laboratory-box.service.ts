import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LaboratoryBoxGateway } from './laboratory-box.gateway';

@Injectable()
export class LaboratoryBoxService {
  constructor(private prisma: PrismaService, private gateway: LaboratoryBoxGateway) {}

  // ✅ Create
  async create(data: any) {
    if (!data.name || typeof data.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string.');
    }

    if (!data.code || typeof data.code !== 'string') {
      throw new BadRequestException('Code is required and must be a string.');
    }

    // Check for unique name/code
    const existing = await this.prisma.laboratoryBox.findFirst({
      where: { OR: [{ name: data.name }, { code: data.code }] },
    });

    if (existing) {
      throw new BadRequestException('LaboratoryBox with same name or code already exists.');
    }

    const created = await this.prisma.laboratoryBox.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim(),
        description: data.description?.trim() || null,
      },
    });

    // 🔥 Real-time update
    this.gateway.broadcastUpdate('create', created);

    return created;
  }

  // ✅ Find all
  async findAll() {
    return this.prisma.laboratoryBox.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Find one
  async findOne(id: string) {
    const box = await this.prisma.laboratoryBox.findUnique({ where: { id } });
    if (!box) throw new NotFoundException('LaboratoryBox not found.');
    return box;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const box = await this.prisma.laboratoryBox.findUnique({ where: { id } });
    if (!box) throw new NotFoundException('LaboratoryBox not found.');

    if (data.name) {
      const existing = await this.prisma.laboratoryBox.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (existing) throw new BadRequestException('Name already in use.');
    }

    if (data.code) {
      const existing = await this.prisma.laboratoryBox.findFirst({
        where: { code: data.code, NOT: { id } },
      });
      if (existing) throw new BadRequestException('Code already in use.');
    }

    const updated = await this.prisma.laboratoryBox.update({
      where: { id },
      data: {
        name: data.name?.trim() ?? box.name,
        code: data.code?.trim() ?? box.code,
        description: data.description?.trim() ?? box.description,
      },
    });

    // 🔥 Real-time update
    this.gateway.broadcastUpdate('update', updated);

    return updated;
  }

  // ✅ Delete
  async remove(id: string) {
    const box = await this.prisma.laboratoryBox.findUnique({ where: { id } });
    if (!box) throw new NotFoundException('LaboratoryBox not found.');

    const deleted = await this.prisma.laboratoryBox.delete({ where: { id } });

    // 🔥 Real-time update
    this.gateway.broadcastUpdate('delete', deleted);

    return deleted;
  }
}
