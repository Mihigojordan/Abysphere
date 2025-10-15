// src/request/request.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestStatus, MovementType, SourceType, Prisma } from 'generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}
  
  async rejectRequest(
    requestId: string,
    data: {
      rejectedByAdminId?: string;
      rejectedByEmployeeId?: string;
      notes?: string;
    },
  ) {
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    console.log(data);
    

    const updatedRequest = await this.prisma.request.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        notes: data.notes || request.notes,
      },
       include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
    });

    return updatedRequest;
  }

   async createRequest(data: {
    siteId: string;
    requestedByAdminId?: string;
    requestedByEmployeeId?: string;
    notes?: string;
    items: Array<{
      stockInId: string;
      qtyRequested: number;
    }>;
  }) {
    // Verify site exists
    const site = await this.prisma.site.findUnique({
      where: { id: data.siteId },
    });

    if (!site) {
      throw new BadRequestException('Invalid site ID');
    }

    // Generate unique ref_no
    const refNo = await this.generateRefNo();

    // Create request with items
    const request = await this.prisma.request.create({
      data: {
        ref_no: refNo,
        siteId: data.siteId,
        requestedByAdminId: data.requestedByAdminId,
        requestedByEmployeeId: data.requestedByEmployeeId,
        notes: data.notes,
        status: RequestStatus.PENDING,
        requestItems: {
          create: data.items.map(item => ({
            stockInId: item.stockInId,
            qtyRequested: new Decimal(item.qtyRequested),
            // Use qtyRequested as the source of truth for remaining
            qtyRemaining: new Decimal(item.qtyRequested),
            qtyIssued: new Decimal(0),
            qtyReceived: new Decimal(0),
          })),
        },
      },
      include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
    });

    return request;
  }

  async issueMaterials(data: {
    requestId: string;
    issuedByAdminId?: string;
    issuedByEmployeeId?: string;
    items: Array<{
      requestItemId: string;
      qtyIssued: number;
      notes?: string;
    }>;
  }) {
    const request = await this.prisma.request.findUnique({
      where: { id: data.requestId },
      include: { requestItems: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    const requestStatus: any = request.status;

    if (![RequestStatus.APPROVED, RequestStatus.PENDING, RequestStatus.RECEIVED].includes(requestStatus)) {
      throw new BadRequestException('Request must be approved before issuing stocks');
    }

    const issuedItems: any = [];
    const stockHistoryRecords: any = [];

    await this.prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const requestItem = await tx.requestItem.findUnique({
          where: { id: item.requestItemId },
          include: { stockIn: true },
        });

        if (!requestItem) {
          throw new NotFoundException(`Request item ${item.requestItemId} not found`);
        }

        const qtyToIssue = new Decimal(item.qtyIssued);
        const currentQtyIssued = requestItem.qtyIssued || new Decimal(0);
        const newQtyIssued = currentQtyIssued.add(qtyToIssue);

        // Validate quantity - compare to qtyRequested (no qtyApproved)
        const qtyRequested = requestItem.qtyRequested;
        if (newQtyIssued.gt(qtyRequested)) {
          throw new BadRequestException(
            `Cannot issue more than requested for ${requestItem.stockIn.productName}`,
          );
        }

        // Check stock availability
        const stockIn = await tx.stockIn.findUnique({
          where: { id: requestItem.stockInId },
        });

        if (!stockIn) {
          throw new NotFoundException('StockIn not found');
        }

        if (stockIn.quantity < item.qtyIssued) {
          throw new BadRequestException(
            `Insufficient stock for ${stockIn.productName}. Available: ${stockIn.quantity}`,
          );
        }

        // Update stock quantity
        const newStockQty = stockIn.quantity - item.qtyIssued;
        await tx.stockIn.update({
          where: { id: stockIn.id },
          data: { quantity: newStockQty },
        });

        // Update request item
        const newQtyRemaining = requestItem.qtyRemaining.sub(qtyToIssue);
        await tx.requestItem.update({
          where: { id: item.requestItemId },
          data: {
            qtyIssued: newQtyIssued,
            qtyRemaining: newQtyRemaining.lte(0) ? new Decimal(0) : newQtyRemaining,
          },
        });

        // Create stock history
        const stockHistory = await tx.stockHistory.create({
          data: {
            stockInId: requestItem.stockInId,
            movementType: MovementType.OUT,
            sourceType: SourceType.ISSUE,
            sourceId: data.requestId,
            qtyBefore: new Decimal(stockIn.quantity),
            qtyChange: qtyToIssue.neg(),
            qtyAfter: new Decimal(newStockQty),
            unitPrice: stockIn.unitPrice,
            notes: item.notes || `Issued for request ${request.ref_no}`,
            createdByAdminId: data.issuedByAdminId,

          },
        });

        issuedItems.push({
          requestItemId: item.requestItemId,
          productName: requestItem.stockIn.productName,
          qtyIssued: item.qtyIssued,
        });

        stockHistoryRecords.push(stockHistory);
      }

      // Check if all items are fully issued: compare to qtyRequested (no qtyApproved)
      const updatedRequestItems = await tx.requestItem.findMany({
        where: { requestId: data.requestId },
      });

      const allItemsIssued = updatedRequestItems.every(item =>
        item.qtyIssued.gte(item.qtyRequested),
      );

      const someItemsIssued = updatedRequestItems.some(item => item.qtyIssued.gt(0));

      let newStatus: any = RequestStatus.APPROVED;
      if (allItemsIssued) {
        newStatus = RequestStatus.ISSUED;
      } else if (someItemsIssued) {
        newStatus = RequestStatus.PARTIALLY_ISSUED;
      }

      // Update request
      await tx.request.update({
        where: { id: data.requestId },
        data: {
          status: newStatus,
          issuedAt: new Date(),
          issuedByAdminId: data.issuedByAdminId,
          issuedByEmployeeId: data.issuedByEmployeeId,
        },
      });
    });

    const updateRequest = await this.prisma.request.findUnique({
      where: { id: data.requestId },
    include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
    });

    return {
      requestId: data.requestId,
      request:updateRequest,
      issuedItems,
      stockHistoryRecords,
    };
  }

  async receiveMaterials(data: {
    requestId: string;
    receivedByAdminId?: string;
    receivedByEmployeeId?: string;
    items: Array<{
      requestItemId: string;
      qtyReceived: number;
    }>;
  }) {
    const request = await this.prisma.request.findUnique({
      where: { id: data.requestId },
      include: { requestItems: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    console.log(request.status);
    

    if (![RequestStatus.ISSUED, RequestStatus.PARTIALLY_ISSUED].includes(request.status as any)) {
      throw new BadRequestException('Request must be issued before receiving stocks');
    }

    const receivedItems: any = [];

    await this.prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        const requestItem = await tx.requestItem.findUnique({
          where: { id: item.requestItemId },
          include: { stockIn: true },
        });

        if (!requestItem) {
          throw new NotFoundException(`Request item ${item.requestItemId} not found`);
        }

        const qtyToReceive = new Decimal(item.qtyReceived);
        const currentQtyReceived = requestItem.qtyReceived || new Decimal(0);
        const newQtyReceived = currentQtyReceived.add(qtyToReceive);

        // Validate quantity: cannot receive more than issued
        if (newQtyReceived.gt(requestItem.qtyIssued)) {
          throw new BadRequestException(
            `Cannot receive more than issued for ${requestItem.stockIn.productName}`,
          );
        }

        // Update request item
        await tx.requestItem.update({
          where: { id: item.requestItemId },
          data: {
            qtyReceived: newQtyReceived,
          },
        });

        // Create stock history for receipt
        await tx.stockHistory.create({
          data: {
            stockInId: requestItem.stockInId,
            movementType: MovementType.IN,
            sourceType: SourceType.RECEIPT,
            sourceId: data.requestId,
            qtyBefore: currentQtyReceived,
            qtyChange: qtyToReceive,
            qtyAfter: newQtyReceived,
            unitPrice: requestItem.stockIn.unitPrice,
            notes: `Received for request ${request.ref_no}`,
            createdByEmployeeId: data.receivedByEmployeeId,
          },
        });

        receivedItems.push({
          requestItemId: item.requestItemId,
          productName: requestItem.stockIn.productName,
          qtyReceived: item.qtyReceived,
        });
      }

      // Check if all items are fully received
      const updatedRequestItems = await tx.requestItem.findMany({
        where: { requestId: data.requestId },
      });

    const allItemsFullyIssuedAndReceived = (() => {
  for (const item of updatedRequestItems) {
    const requested = new Decimal(item.qtyRequested || 0);
    const issued = new Decimal(item.qtyIssued || 0);
    const received = new Decimal(item.qtyReceived || 0);

    // Item must be fully issued
    if (issued.lt(requested)) return false;

    // If it was issued, it must be fully received
    if (issued.gt(0) && received.lt(issued)) return false;
  }

  // All items passed the checks
  return true;
})();


      // Update request status
      await tx.request.update({
  where: { id: data.requestId },
  data: {
    receivedAt: new Date(),
    status: allItemsFullyIssuedAndReceived ? RequestStatus.CLOSED : RequestStatus.RECEIVED,
    closedAt: allItemsFullyIssuedAndReceived ? new Date() : null,
    closedByAdminId: allItemsFullyIssuedAndReceived ? data.receivedByAdminId : null,
    closedByEmployeeId: allItemsFullyIssuedAndReceived ? data.receivedByEmployeeId : null,
  },
});
});

const updateRequest = await this.prisma.request.findUnique({
      where: { id: data.requestId },
     include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
    });

    return {
      requestId: data.requestId,
      request:updateRequest,
      receivedItems,
    };
  }

  /**
   * Modify and/or approve a request
   */
  async modifyAndApproveRequest(
    requestId: string,
    data: {
      notes?: string;
      itemModifications?: Array<{
        requestItemId: string;
        qtyRequested?: number;
        stockInId?: string;
      }>;
      itemsToAdd?: Array<{
        stockInId: string;
        qtyRequested: number;
      }>;
      itemsToRemove?: string[];
      modificationReason?: string;
    },
  ) {
    // 1️⃣ Fetch request with items
    const request = await this.prisma.request.findUnique({
      where: { id: requestId },
      include: { requestItems: true },
    });

    if (!request) throw new NotFoundException('Request not found');

    // ensure request is in a correct state for modification (original code had a confusing message)
    if (![RequestStatus.PENDING].includes(request.status as any)) {
      throw new BadRequestException('Only pending requests can be modified/approved');
    }

    // 3️⃣ Transaction for atomic modifications
    return this.prisma.$transaction(async (tx) => {
      // 3a. Update notes if provided
      if (data.notes !== undefined) {
        await tx.request.update({
          where: { id: requestId },
          data: { notes: data.notes },
        });
      }

      // 3b. Modify existing items
      if (data.itemModifications?.length) {
        for (const mod of data.itemModifications) {
          const updateData: any = {};
          if (mod.qtyRequested !== undefined) {
            updateData.qtyRequested = new Decimal(mod.qtyRequested);
            // reset remaining to match new requested amount
            updateData.qtyRemaining = new Decimal(mod.qtyRequested);
          }
          if (mod.stockInId !== undefined) updateData.stockInId = mod.stockInId;

          if (Object.keys(updateData).length > 0) {
            await tx.requestItem.update({
              where: { id: mod.requestItemId },
              data: updateData,
            });
          }
        }
      }

      // 3c. Add new items
      if (data.itemsToAdd?.length) {
        for (const item of data.itemsToAdd) {
          await tx.requestItem.create({
            data: {
              requestId,
              stockInId: item.stockInId,
              qtyRequested: new Decimal(item.qtyRequested),
              // qtyRemaining equals qtyRequested
              qtyRemaining: new Decimal(0),
              qtyIssued: new Decimal(0),
              qtyReceived: new Decimal(0),
            },
          });
        }
      }

      // 3d. Remove items
      if (data.itemsToRemove?.length) {
        await tx.requestItem.deleteMany({
          where: {
            id: { in: data.itemsToRemove },
            requestId,
          },
        });
      }

      // 4️⃣ Return updated request with all items
      return tx.request.findUnique({
        where: { id: requestId },
       include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
      });
    });
  }


  async findAll(params: {
    page?: number;
    limit?: number;
    siteId?: string;
    status?: RequestStatus;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.siteId) where.siteId = params.siteId;
    if (params.status) where.status = params.status;

    const [requests, total] = await Promise.all([
      this.prisma.request.findMany({
        where,
        skip,
        take: limit,
        include: {
          site: true,
          requestedByAdmin: true,
          requestedByEmployee: true,

          requestItems: {
            include: {
              stockIn: {
                include: {
                  stockcategory: true,
                  store: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.request.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }


  async findOne(id: string) {
    const request = await this.prisma.request.findUnique({
      where: { id },
      include: {
        site: true,
        requestedByAdmin: true,
        requestedByEmployee: true,
        issuedByAdmin: true,
        issuedByEmployee: true,
        closedByAdmin: true,
        closedByEmployee: true,
        rejectedByAdmin:true,
        rejectedByEmployee:true,
        stockhistory:true,
        requestItems: {
          include: {
            stockIn: {
              include: {
                stockcategory: true,
                store: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  // Service method
async addAttachment(
  requestId: string,
  data: {
  fileName: string;
  fileUrl: string;
  role: string;
  userId: string;
  uploadedAt: string;
  description?: string;
}) {
  const request = await this.prisma.request.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundException('Request not found');

let attachments: Array<any> = [];

if (Array.isArray(request.attachments as any)) {
  try {
    attachments = JSON.parse(request.attachments as string);
  } catch (err) {
    console.error('Failed to parse attachments JSON:', err);
    attachments = [];
  }
} 
// attachments is now always an array, either parsed from JSON or empty

  attachments.push({
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    uploadedBy: data.role,
    uploadedById: data.userId,
    uploadedAt: new Date(),
    description: data.description || '',
  });

  await this.prisma.request.update({
    where: { id: requestId },
    data: { attachments },
  });

  return { success: true, attachments };
}


// Service method
async addComment(
  requestId: string,
  data: {
  userId: string;
  role: string;
  description: string;
  uploadedAt: string;
}) {
  const request = await this.prisma.request.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundException('Request not found');

  let comments: Array<any> = [];

if (Array.isArray(request.comments as any)) {
  try {
    comments = JSON.parse(request.comments as string);
  } catch (err) {
    console.error('Failed to parse comments JSON:', err);
    comments = [];
  }
} 
// attachments is now always an array, either parsed from JSON or empty

  comments.push({
    userId: data.userId,
    role: data.role,
    description: data.description,
    uploadedAt: data.uploadedAt,
  });

  await this.prisma.request.update({
    where: { id: requestId },
    data: { comments },
  });

  return { success: true, comments };
}


  private async generateRefNo(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.prisma.request.count({
      where: {
        createdAt: {
          gte: new Date(year, date.getMonth(), 1),
          lt: new Date(year, date.getMonth() + 1, 1),
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `REQ-${year}${month}-${sequence}`;
  }
}