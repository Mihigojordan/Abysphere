import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AssetRequestService } from './request.service';

@Controller('asset-requests')
export class AssetRequestController {
  constructor(private readonly assetRequestService: AssetRequestService) {}

  @Post()
  async create(@Body() body: any) {
    try {
      return await this.assetRequestService.create(body);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.assetRequestService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('/procurement')
  async getItemsForProcurement() {
    try {
      return await this.assetRequestService.getItemsForProcurement();
    } catch (error) {
      return { error: error.message };
    }
  }
  @Get('/procurement/:id')
  async getItemForProcurementById( @Param('id') id: string) {
    try {
      return await this.assetRequestService.getItemForProcurementById(id);
    } catch (error) {
      return { error: error.message };
    }
  }
  
  @Patch('/procurement/update')
  async updateProcurement(
    @Body() body: { assetId: string; orderedQuantity: number },
  ) {
    try {
      return await this.assetRequestService.updateProcurementStatus(
        body.assetId,
        body.orderedQuantity,
      );
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.assetRequestService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.assetRequestService.update(id, body);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.assetRequestService.remove(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('issuedItems') issuedItems: { itemId: string; issuedQuantity: number }[],
  ) {
    try {
      return await this.assetRequestService.approveAndIssueRequest(id, issuedItems);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    try {
      return await this.assetRequestService.reject(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
