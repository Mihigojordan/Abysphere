import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('stores')
@UseGuards(AdminJwtAuthGuard) // ✅ Protect all routes with admin guard
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // ✅ Create Store
  @Post()
  async create(@Req() req: RequestWithAdmin, @Body() body: any) {
    const adminId = req.admin!.id;
    return await this.storeService.create({ ...body, adminId });
  }

  // ✅ Get All Stores (optionally filtered by search)
  @Get()
  async findAll(@Req() req: RequestWithAdmin, @Query('search') search?: string) {
    const adminId = req.admin!.id;
    return await this.storeService.findAll({ search, adminId });
  }

  // ✅ Get One Store by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.storeService.findOne(id);
  }

  // ✅ Get Stores by Manager ID
  @Get('manager/:id')
  async findStoresByManagerId(@Param('id') id: string) {
    return await this.storeService.findStoresByManagerId(id);
  }

  // ✅ Update Store
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.storeService.update(id, body);
  }

  // ✅ Delete Store
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.storeService.remove(id);
  }
}
