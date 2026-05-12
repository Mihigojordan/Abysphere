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
import { ExpenseManagementService } from './expense-management.service';
import { DualAuthGuard, RequestWithAdminEmployee } from 'src/guards/dual-auth.guard';

@Controller('expense-management')
@UseGuards(DualAuthGuard)
export class ExpenseManagementController {
  constructor(private readonly expenseService: ExpenseManagementService) {}

  @Post()
  async create(@Req() req: RequestWithAdminEmployee, @Body() data: any) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      return await this.expenseService.create(adminId, data);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(@Req() req: RequestWithAdminEmployee) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      return await this.expenseService.findAll(adminId);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  async findOne(@Req() req: RequestWithAdminEmployee, @Param('id') id: string) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      return await this.expenseService.findOne(adminId, id);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(
    @Req() req: RequestWithAdminEmployee,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      return await this.expenseService.update(adminId, id, data);
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Req() req: RequestWithAdminEmployee, @Param('id') id: string) {
    try {
      const adminId = req.admin?.id ?? req.employee?.adminId;
      await this.expenseService.remove(adminId, id);
      return { message: 'Expense deleted successfully' };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
    }
  }
}
