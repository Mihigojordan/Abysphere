import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GrownEggPondService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create Pond
  async create(data: any) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new BadRequestException('Name is required and must be a non-empty string.');
    }

    // Check unique name
    const existing = await this.prisma.grownEggPond.findUnique({ where: { name: data.name.trim() } });
    if (existing) throw new BadRequestException(`GrownEggPond with name "${data.name}" already exists.`);

    if (data.size && typeof data.size !== 'number') {
      throw new BadRequestException('Size must be a number.');
    }

    return this.prisma.grownEggPond.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() ?? null,
        size: data.size ?? null,
        description: data.description?.trim() ?? null,
      },
    });
  }

  // ✅ Find all
  async findAll() {
    return this.prisma.grownEggPond.findMany({
      orderBy: { createdAt: 'desc' },
      include: { EggToPondMigrations: true },
    });
  }

  // ✅ Find one
  async findOne(id: string) {
    const pond = await this.prisma.grownEggPond.findUnique({
      where: { id },
      include: { EggToPondMigrations: true },
    });
    if (!pond) throw new NotFoundException('GrownEggPond not found.');
    return pond;
  }

  // ✅ Update
  async update(id: string, data: any) {
    const pond = await this.prisma.grownEggPond.findUnique({ where: { id } });
    if (!pond) throw new NotFoundException('GrownEggPond not found.');

    if (data.name && typeof data.name !== 'string') {
      throw new BadRequestException('Name must be a string.');
    }

    if (data.size && typeof data.size !== 'number') {
      throw new BadRequestException('Size must be a number.');
    }

    return this.prisma.grownEggPond.update({
      where: { id },
      data: {
        name: data.name?.trim() ?? pond.name,
        code: data.code?.trim() ?? pond.code,
        size: data.size ?? pond.size,
        description: data.description?.trim() ?? pond.description,
      },
    });
  }

  // ✅ Delete
  async remove(id: string) {
    const pond = await this.prisma.grownEggPond.findUnique({ where: { id } });
    if (!pond) throw new NotFoundException('GrownEggPond not found.');
    return this.prisma.grownEggPond.delete({ where: { id } });
  }
}
