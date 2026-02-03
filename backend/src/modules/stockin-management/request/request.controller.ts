// src/request/request.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RequestService } from './request.service';
import { RequestStatus } from 'generated/prisma';
import { RequestGateway } from './request.gateway';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AttachmentsFileFields, AttachmentsUploadConfig } from 'src/common/utils/file-upload.utils';

// DTOs
export class CreateRequestDto {
  siteId: string;
  requestedByAdminId?: string;
  requestedByEmployeeId?: string;
  notes?: string;
  items: Array<{
    stockInId: string;
    qtyRequested: number;
  }>;
}

export class FindAllRequestsDto {
  page?: string;
  limit?: string;
  siteId?: string;
  status?: RequestStatus;
}

export class ApproveRequestDto {
  approvedByAdminId?: string;
  approvedByEmployeeId?: string;
  itemApprovals?: Array<{
    requestItemId: string;
    qtyApproved: number;
  }>;
}

export class RejectRequestDto {
  rejectedByAdminId?: string;
  rejectedByEmployeeId?: string;
  notes?: string;
}

export class IssueMaterialsDto {
  requestId: string;
  issuedByAdminId?: string;
  issuedByEmployeeId?: string;
  items: Array<{
    requestItemId: string;
    qtyIssued: number;
    notes?: string;
  }>;
}

export class ReceiveMaterialsDto {
  requestId: string;
  receivedByAdminId?: string;
  receivedByEmployeeId?: string;
  items: Array<{
    requestItemId: string;
    qtyReceived: number;
  }>;
}

export class ModifyAndApproveRequestDto {
  notes?: string;
  itemModifications?: Array<{
    requestItemId: string;
    qtyRequested?: number;
    qtyApproved?: number;
    stockInId?: string;
  }>;
  itemsToAdd?: Array<{
    stockInId: string;
    qtyRequested: number;
    qtyApproved?: number;
  }>;
  userId:string;
  userRole:string;
  itemsToRemove?: string[];
  modificationReason?: string;
}


@Controller('stock-requests')
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
     private readonly requestGateway: RequestGateway, // Inject the gateway
) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRequestDto: CreateRequestDto) {
    const request = await this.requestService.createRequest(createRequestDto);
    this.requestGateway.emitRequestCreated(request)
    return {
      success: true,
      data: { request },
      message: 'Request created successfully',
    };
  }

  @Get()
  async findAll(@Query() query: FindAllRequestsDto) {
    const result = await this.requestService.findAll({
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
      siteId: query.siteId,
      status: query.status,
    });



    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const request = await this.requestService.findOne(id);
    return {
      success: true,
      data: { request },
    };
  }

 
  @Patch(':id/modify-approve')
  async modifyAndApprove(
    @Param('id') id: string,
    @Body() data: ModifyAndApproveRequestDto,
  
  ) {



    
    // Call the service function
    const updatedRequest: any = await this.requestService.modifyAndApproveRequest(
      id,
      
      data,
    );

    // Emit WebSocket event to notify clients
    this.requestGateway.emitRequestUpdated(updatedRequest);

    return {
      success: true,
      message: 'Request modified and approved successfully',
      data: { request: updatedRequest },
    };
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() rejectRequestDto: RejectRequestDto,
  ) {
    const request = await this.requestService.rejectRequest(id, rejectRequestDto);
     this.requestGateway.emitRequestRejected(request)
    return {
      success: true,
      data: { request },
      message: 'Request rejected',
    };
  }

  @Post('issue-materials')
  async issueMaterials(@Body() issueMaterialsDto: IssueMaterialsDto) {
    const result = await this.requestService.issueMaterials(issueMaterialsDto);
     this.requestGateway.emitMaterialsIssued(result.request)
    return {
      success: true,
      data: result,
      message: 'Materials issued successfully',
    };
  }

  @Post('receive-materials')
  async receiveMaterials(@Body() receiveMaterialsDto: ReceiveMaterialsDto) {
    const result = await this.requestService.receiveMaterials(receiveMaterialsDto);
     this.requestGateway.emitMaterialsReceived(result.request)
    return {
      success: true,
      data: result,
      message: 'Materials received successfully',
    };
  }

    @Post(':id/attachments')
     @UseInterceptors(
            FileFieldsInterceptor(AttachmentsFileFields, AttachmentsUploadConfig)
        )
  async addAttachment(
    
    @Param('id') id: string,
    @UploadedFiles() files: { attachmentImg?: Express.Multer.File[] },
    @Body() body: { fileUrl: string; role: string; userId: string; createdAt?: string; description?: string },
  ) {


    
        if (files?.attachmentImg?.[0]?.filename) {
            body.fileUrl = `/uploads/attachment_images/${files.attachmentImg[0].filename}`;
        }


    
    const attachments = await this.requestService.addAttachment(id, body as any);
    return attachments;
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() body: { userId: string; role: string; description: string; uploadedAt?: string }
  ) {

    const comments = await this.requestService.addComment(id, body as any);
    return comments;
  }
}

