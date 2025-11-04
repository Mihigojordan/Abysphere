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
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('stockout')
export class StockoutController {
  constructor(private readonly stockoutService: StockoutService) {}

  @Post('create')
  @UseGuards(AdminJwtAuthGuard)
  async register(@Body() body: any,@Req() req: RequestWithAdmin) {

    try {
        body.adminId = req.admin?.id

       
      return await this.stockoutService.create(body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('all')
    @UseGuards(AdminJwtAuthGuard)
  async getAll(@Req() req: RequestWithAdmin) {
    try {
      return await this.stockoutService.getAll(req.admin!.id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('update/:id')
   @UseGuards(AdminJwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.stockoutService.update(id, body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('delete/:id')
   @UseGuards(AdminJwtAuthGuard)
  async delete(@Param('id') id: string, @Body() data) {
    try {
      return await this.stockoutService.delete(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }
}
