import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  // ✅ Create Stock
  @Post('create')
  @UseGuards(AdminJwtAuthGuard)
  async createStock(@Req() req: RequestWithAdmin, @Body() data) {
    const adminId = req.admin!.id;
    return await this.stockService.createStock(data, adminId);
  }

  // ✅ Get All Stocks
  @Get('all')
  @UseGuards(AdminJwtAuthGuard)
  async getAllStocks(@Req() req: RequestWithAdmin) {
    const adminId = req.admin!.id;
    return await this.stockService.findAll(adminId);
  }

  // ✅ Get Stock by ID
  @Get('getone/:id')
  @UseGuards(AdminJwtAuthGuard)
  async getStockById(@Param('id') id: string) {
    return await this.stockService.findOne(Number(id));
  }

  // ✅ Update Stock
  @Put('update/:id')
  @UseGuards(AdminJwtAuthGuard)
  async updateStock(@Req() req: RequestWithAdmin, @Param('id') id: string, @Body() data) {
    const adminId = req.admin!.id;
    return await this.stockService.update(Number(id), data, adminId);
  }

  // ✅ Delete Stock
  @Delete('delete/:id')
  @UseGuards(AdminJwtAuthGuard)
  async deleteStock(@Param('id') id: string) {
    return await this.stockService.remove(Number(id));
  }

  // ── Stock History Endpoints ──────────────────────────────────────

  @Get('history/all')
  @UseGuards(AdminJwtAuthGuard)
  async getStockHistory() {
    return await this.stockService.getStockHistory();
  }

  @Get('history/:stockId')
  @UseGuards(AdminJwtAuthGuard)
  async getStockHistoryByStockId(@Param('stockId') stockId: string) {
    return await this.stockService.getStockHistoryByStockId(Number(stockId));
  }
}
