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
import { DebitService } from './debit.service';
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('debit')
export class DebitController {
  constructor(private readonly debitService: DebitService) {}

  @Post('create')
  @UseGuards(AdminJwtAuthGuard)
  async create(@Body() body: any, @Req() req: RequestWithAdmin) {
    try {
      body.adminId = req.admin?.id;
      return await this.debitService.create(body);
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
      return await this.debitService.getAll(req.admin!.id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('stats')
  @UseGuards(AdminJwtAuthGuard)
  async getStats(@Req() req: RequestWithAdmin) {
    try {
      return await this.debitService.getStats(req.admin!.id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('getone/:id')
  @UseGuards(AdminJwtAuthGuard)
  async getOne(@Param('id') id: string) {
    try {
      return await this.debitService.getOne(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('stockout/:stockOutId')
  @UseGuards(AdminJwtAuthGuard)
  async getByStockOutId(@Param('stockOutId') stockOutId: string) {
    try {
      return await this.debitService.getByStockOutId(stockOutId);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post('payment/:id')
  @UseGuards(AdminJwtAuthGuard)
  async recordPayment(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.debitService.recordPayment(id, body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('update/:id')
  @UseGuards(AdminJwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.debitService.update(id, body);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('cancel/:id')
  @UseGuards(AdminJwtAuthGuard)
  async cancel(@Param('id') id: string) {
    try {
      return await this.debitService.cancel(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('delete/:id')
  @UseGuards(AdminJwtAuthGuard)
  async delete(@Param('id') id: string) {
    try {
      return await this.debitService.delete(id);
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
