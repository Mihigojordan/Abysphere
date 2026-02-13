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
import { GRNService, CreateGRNDto } from './grn.service';
import { InspectionStatus } from '../../../generated/prisma';

@Controller('grn')
export class GRNController {
    constructor(private readonly grnService: GRNService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDto: CreateGRNDto) {
        return this.grnService.create(createDto);
    }

    @Get()
    async findAll(@Query() filters: any) {
        return this.grnService.findAll(filters);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.grnService.findOne(id);
    }

    @Post(':id/approve')
    async approve(
        @Param('id') id: string,
        @Body() body: { approvedById: string; isAdmin?: boolean },
    ) {
        return this.grnService.approve(id, body.approvedById, body.isAdmin);
    }

    @Post(':id/reject')
    async reject(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.grnService.reject(id, body.reason);
    }

    @Put(':id/inspection')
    async updateInspection(
        @Param('id') id: string,
        @Body()
        body: {
            status: InspectionStatus;
            inspectionNotes?: string;
            qualityNotes?: string;
        },
    ) {
        return this.grnService.updateInspection(
            id,
            body.status,
            body.inspectionNotes,
            body.qualityNotes,
        );
    }
}
