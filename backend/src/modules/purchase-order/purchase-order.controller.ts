import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PurchaseOrderService, CreatePODto, UpdatePODto } from './purchase-order.service';

@Controller('purchase-order')
export class PurchaseOrderController {
    constructor(private readonly poService: PurchaseOrderService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreatePODto) {
        return this.poService.create(createDto);
    }

    @Get()
    async findAll(@Query() filters: any) {
        return this.poService.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.poService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: UpdatePODto) {
        return this.poService.update(id, updateDto);
    }

    @Post(':id/submit')
    async submit(@Param('id') id: string) {
        return this.poService.submit(id);
    }

    @Post(':id/approve')
    async approve(
        @Param('id') id: string,
        @Body() body: { approvedById: string; isAdmin?: boolean },
    ) {
        return this.poService.approve(id, body.approvedById, body.isAdmin);
    }

    @Post(':id/cancel')
    async cancel(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.poService.cancel(id, body.reason);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.poService.remove(id);
    }
}
