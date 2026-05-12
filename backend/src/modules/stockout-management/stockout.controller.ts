import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StockoutService } from './stockout.service';
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('stockout')
export class StockoutController {
  constructor(private readonly stockoutService: StockoutService) { }

  @Get('performance')
  @UseGuards(DualAuthGuard)
  async getProductPerformance(@Req() req: RequestWithAdminEmployee) {
    const adminId = req.admin?.id ?? req.employee?.adminId;
    return await this.stockoutService.getProductPerformance(adminId);
  }

  @Post('create')
  @UseGuards(DualAuthGuard)
  async register(@Body() body: any, @Req() req: RequestWithAdminEmployee) {
    try {
      body.adminId = req.admin?.id ?? req.employee?.adminId;
      body.employeeId = req.employee?.id ?? null;
      return await this.stockoutService.create(body);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Post('bulk-import')
  @UseGuards(DualAuthGuard)
  async bulkImport(@Body() body: any[], @Req() req: RequestWithAdminEmployee) {
    try {
      if (!Array.isArray(body)) {
        throw new HttpException('Input must be an array', HttpStatus.BAD_REQUEST);
      }
      const adminId = req.admin?.id ?? req.employee?.adminId;
      return await this.stockoutService.bulkImport(body, adminId);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('all')
  @UseGuards(DualAuthGuard)
  async getAll(@Req() req: RequestWithAdminEmployee) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      const employeeId = req.employee?.id ?? null;
      return await this.stockoutService.getAll(adminId, employeeId);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('transaction/:id')
  async getStockoutByTransactionId(@Param('id') id: string) {
    try {
      return await this.stockoutService.getStockOutByTransactionId(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('getone/:id')
  async getOne(@Param('id') id: string) {
    try {
      return await this.stockoutService.getOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Put('update/:id')
  @UseGuards(DualAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.stockoutService.update(id, body);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('delete/:id')
  @UseGuards(DualAuthGuard)
  async delete(@Param('id') id: string, @Body() data) {
    try {
      return await this.stockoutService.delete(id);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }
}
