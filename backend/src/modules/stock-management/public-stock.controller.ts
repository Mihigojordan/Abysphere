import { Controller, Get, Param, Query } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('public-stock')
export class PublicStockController {
  constructor(private readonly stockService: StockService) {}

  // Public: in-stock items with optional search/filter/sort/pagination
  @Get('all')
  async getAllPublic(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.stockService.findAllPublic({
      search,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 8,
    });
  }

  // Public: single in-stock item by ID
  @Get(':id')
  async getOnePublic(@Param('id') id: string) {
    return this.stockService.findOnePublic(Number(id));
  }
}
