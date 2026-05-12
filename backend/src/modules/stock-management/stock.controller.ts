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
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) { }

  @Post('create')
  @UseGuards(DualAuthGuard)
  async createStock(@Req() req: RequestWithAdminEmployee, @Body() data) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    const employeeId = req.employee?.id ?? null;
    return await this.stockService.createStock(data, adminId, employeeId);
  }

  @Post('bulk-import')
  @UseGuards(DualAuthGuard)
  async bulkImport(@Req() req: RequestWithAdminEmployee, @Body() data: any[]) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.bulkImport(data, adminId);
  }

  @Get('all')
  @UseGuards(DualAuthGuard)
  async getAllStocks(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.findAll(adminId);
  }

  @Get('alerts')
  @UseGuards(DualAuthGuard)
  async getStockAlerts(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.getStockAlerts(adminId);
  }

  @Get('getone/:id')
  @UseGuards(DualAuthGuard)
  async getStockById(@Param('id') id: string) {
    return await this.stockService.findOne(Number(id));
  }

  @Put('update/:id')
  @UseGuards(DualAuthGuard)
  async updateStock(@Req() req: RequestWithAdminEmployee, @Param('id') id: string, @Body() data) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.update(Number(id), data, adminId);
  }

  @Delete('delete/:id')
  @UseGuards(DualAuthGuard)
  async deleteStock(@Param('id') id: string) {
    return await this.stockService.remove(Number(id));
  }

  @Get('history/all')
  @UseGuards(DualAuthGuard)
  async getStockHistory(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.getStockHistory(adminId);
  }

  @Get('history/:stockId')
  @UseGuards(DualAuthGuard)
  async getStockHistoryByStockId(@Req() req: RequestWithAdminEmployee, @Param('stockId') stockId: string) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockService.getStockHistoryByStockId(Number(stockId), adminId);
  }
}
