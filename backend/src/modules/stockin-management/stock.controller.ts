import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { StockGateway } from './stock.gateway';
import { Unit } from 'generated/prisma';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly stockGateway: StockGateway, // inject gateway
  ) {}

  // --------------------------
  // CATEGORY ROUTES
  // --------------------------
  @Post('category')
  async createCategory(@Body() body: { name: string; description?: string }) {
    const category = await this.stockService.createCategory(body);
    this.stockGateway.emitCategoryCreated(category);
    return category;
  }

  @Get('category')
  async getAllCategories() {
    return this.stockService.getAllCategories();
  }

  @Get('category/:id')
  async getCategory(@Param('id') id: string) {
    return this.stockService.getCategoryById(id);
  }

  @Put('category/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const category = await this.stockService.updateCategory(id, body);
    this.stockGateway.emitCategoryUpdated(category);
    return category;
  }

  @Delete('category/:id')
  async deleteCategory(@Param('id') id: string) {
    const deleted = await this.stockService.deleteCategory(id);
    this.stockGateway.emitCategoryDeleted(id);
    return deleted;
  }

  // --------------------------
  // STOCKIN ROUTES
  // --------------------------
  @Post('stockin')
  async createStockIn(
    @Body()
    body: {
      productName: string;
      sku?: string;
      quantity?: number;
      unit: Unit;
      unitPrice: number;
      reorderLevel?: number;
      supplier?: string;
      location?: string;
      description?: string;
      stockcategoryId: string;
      storeId: string;
    },
  ) {
    const stock = await this.stockService.createStockIn(body);
    this.stockGateway.emitStockInCreated(stock);
    return stock;
  }

  @Get('stockin')
  async getAllStockIns() {
    return this.stockService.getAllStockIns();
  }

  @Get('stockin/:id')
  async getStockIn(@Param('id') id: string) {
    return this.stockService.getStockInById(id);
  }

  @Get('history')
  async getAll() {
    return this.stockService.getAllStockHistory();
  }

  // GET /stock-history/stock/:stockInId
  @Get('history/stock/:stockInId')
  async getByStock(@Param('stockInId') stockInId: string) {
    return this.stockService.getStockHistoryByStock(stockInId);
  }

  // GET /stock-history/request/:requestId
  @Get('history/request/:requestId')
  async getByRequest(@Param('requestId') requestId: string) {
    return this.stockService.getStockHistoryByRequest(requestId);
  }

  // GET /stock-history/movement?type=IN
  @Get('history/movement')
  async getByMovement(
    @Query('type') type: 'IN' | 'OUT' | 'ADJUSTMENT',
   ) {
    return this.stockService.getStockHistoryByMovement(type);
  }

  @Put('stockin/:id')
  async updateStockIn(
    @Param('id') id: string,
    @Body()
    body: {
      productName?: string;
      sku?: string;
      quantity?: number;
      unit?: Unit;
      unitPrice?: number;
      reorderLevel?: number;
      supplier?: string;
      location?: string;
      description?: string;
      stockcategoryId?: string;
      storeId?: string;
    },
  ) {
    const stock = await this.stockService.updateStockIn(id, body);
    this.stockGateway.emitStockInUpdated(stock);
    return stock;
  }

  @Delete('stockin/:id')
  async deleteStockIn(@Param('id') id: string) {
    const deleted = await this.stockService.deleteStockIn(id);
    this.stockGateway.emitStockInDeleted(id);
    return deleted;
  }
}
