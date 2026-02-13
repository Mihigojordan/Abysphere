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
import { AdminJwtAuthGuard } from 'src/guards/adminGuard.guard';
import { RequestWithAdmin } from 'src/common/interfaces/admin.interface';

@Controller('expense-management')
@UseGuards(AdminJwtAuthGuard)
export class ExpenseManagementController {
    constructor(private readonly expenseService: ExpenseManagementService) { }

    @Post()
    async create(@Req() req: RequestWithAdmin, @Body() data: any) {
        try {
            return await this.expenseService.create(req.admin!.id, data);
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    async findAll(@Req() req: RequestWithAdmin) {
        try {
            return await this.expenseService.findAll(req.admin!.id);
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':id')
    async findOne(@Req() req: RequestWithAdmin, @Param('id') id: string) {
        try {
            return await this.expenseService.findOne(req.admin!.id, id);
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
        }
    }

    @Put(':id')
    async update(
        @Req() req: RequestWithAdmin,
        @Param('id') id: string,
        @Body() data: any,
    ) {
        try {
            return await this.expenseService.update(req.admin!.id, id, data);
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    async remove(@Req() req: RequestWithAdmin, @Param('id') id: string) {
        try {
            await this.expenseService.remove(req.admin!.id, id);
            return { message: 'Expense deleted successfully' };
        } catch (error) {
            throw new HttpException(error.message, error.status || HttpStatus.NOT_FOUND);
        }
    }
}
