import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetRequestGateway } from './request.gateway';
import { RequestStatus, ProcurementStatus } from 'generated/prisma';
@Injectable()
export class AssetRequestService {
  constructor(
    private prisma: PrismaService,
    private assetGateway: AssetRequestGateway,
  ) {}

  // Create request
  async create(requestData: any) {
    try {
      const { employeeId, description, items } = requestData;

      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });
      if (!employee) throw new BadRequestException('Employee not found');

      // Check assets exist
      for (const item of items) {
        const asset = await this.prisma.asset.findUnique({
          where: { id: item.assetId },
        });
        if (!asset)
          throw new BadRequestException(`Asset not found: ${item.assetId}`);
      }

      const createdRequest = await this.prisma.assetRequest.create({
        data: {
          employeeId,
          description,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              assetId: item.assetId,
              quantity: item.quantity || 1,
            })),
          },
        },
        include: { items: { include: { asset: true } }, employee: true },
      });

      this.assetGateway.emitRequestCreated(createdRequest);

      return createdRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Find all requests
  async findAll() {
    try {
      return await this.prisma.assetRequest.findMany({
        include: { items: { include: { asset: true } }, employee: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Find one request
  async findOne(id: string) {
    try {
      const request = await this.prisma.assetRequest.findUnique({
        where: { id },
        include: {
          items: {
            include: { asset: true },
          },
          employee: true,
        },
      });
      if (!request) throw new BadRequestException('Request not found');
      return request;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Update a request
  async update(id: string, updateData: any) {
    try {
      const request = await this.prisma.assetRequest.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!request) throw new BadRequestException('Request not found');
      if (request.status !== 'PENDING')
        throw new BadRequestException('Only PENDING requests can be updated');

      // Update items if provided
      if (updateData.items) {
        await this.prisma.assetRequestItem.deleteMany({
          where: { requestId: id },
        });
        await this.prisma.assetRequestItem.createMany({
          data: updateData.items.map((item) => ({
            requestId: id,
            assetId: item.assetId,
            quantity: item.quantity || 1,
          })),
        });
      }

      const updatedRequest = await this.prisma.assetRequest.update({
        where: { id },
        data: { description: updateData.description || request.description },
        include: { items: true, employee: true },
      });

      this.assetGateway.emitRequestUpdated(updatedRequest);

      return updatedRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Delete a request
  async remove(id: string) {
    try {
      const request = await this.prisma.assetRequest.findUnique({
        where: { id },
      });
      if (!request) throw new BadRequestException('Request not found');
      if (request.status !== 'PENDING')
        throw new BadRequestException('Only PENDING requests can be deleted');

      await this.prisma.assetRequestItem.deleteMany({
        where: { requestId: id },
      });
      await this.prisma.assetRequest.delete({ where: { id } });

      this.assetGateway.emitRequestDeleted(id);

      return { message: 'Request deleted successfully', id };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Approve and Issue request
  async approveAndIssueRequest(
    requestId: string,
    issuedItems: { itemId: string; issuedQuantity: number }[],
  ) {
    try {
      const request = await this.prisma.assetRequest.findUnique({
        where: { id: requestId },
        include: { items: true },
      });
      if (!request) throw new NotFoundException('Request not found');
      if (request.status !== 'PENDING')
        throw new BadRequestException('Request not pending');

      let fullyIssued = true;
      let allUnavailable = true;

      for (const issued of issuedItems) {
        const item = request.items.find((i) => i.id === issued.itemId);
        if (!item) continue;

        const asset = await this.prisma.asset.findUnique({
          where: { id: item.assetId },
        });
        if (!asset)
          throw new BadRequestException(`Asset not found: ${item.assetId}`);

        const currentQty = Number(asset.quantity);

        // 🧠 If asset has zero quantity → mark item for procurement
        if (currentQty <= 0) {
          fullyIssued = false;

          await this.prisma.assetRequestItem.update({
            where: { id: item.id },
            data: {
              quantityIssued: 0,
              status: 'PENDING_PROCUREMENT',
              procurementStatus: 'REQUIRED',
            },
          });

          // Emit real-time update for item
          this.assetGateway.emitRequestStatusChanged(
            item.id,
            'PENDING_PROCUREMENT',
          );
          continue;
        }

        // At least one item had stock
        allUnavailable = false;

        // Normal issuance logic
        const issueQty = Math.min(issued.issuedQuantity, currentQty);

        const itemStatus =
          issueQty === item.quantity ? 'ISSUED' : 'PARTIALLY_ISSUED';
        if (issueQty < item.quantity) fullyIssued = false;

        const procurementStatus =
          issueQty < item.quantity ? 'REQUIRED' : 'NOT_REQUIRED';

        await this.prisma.assetRequestItem.update({
          where: { id: item.id },
          data: {
            quantityIssued: issueQty,
            status: itemStatus,
            procurementStatus,
          },
        });

        await this.prisma.asset.update({
          where: { id: asset.id },
          data: { quantity: String(currentQty - issueQty) },
        });
      }

      let finalStatus: RequestStatus;

      if (allUnavailable) {
        // All items out of stock → keep request as pending
        finalStatus = RequestStatus.PENDING;
      } else if (fullyIssued) {
        finalStatus = RequestStatus.ISSUED;
      } else {
        finalStatus = RequestStatus.PARTIALLY_ISSUED;
      }

      const updatedRequest = await this.prisma.assetRequest.update({
        where: { id: requestId },
        data: { status: finalStatus },
        include: { items: true, employee: true },
      });

      this.assetGateway.emitRequestStatusChanged(requestId, finalStatus);
      return updatedRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Fetch all items that need procurement
  async getItemsForProcurement() {
    try {
      return await this.prisma.assetRequestItem.findMany({
        where: { status: 'PENDING_PROCUREMENT' },
        include: { asset: true, request: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Fetch all items that need procurement
  async getItemForProcurementById(id: string) {
    try {
      return await this.prisma.assetRequestItem.findMany({
        where: { status: 'PENDING_PROCUREMENT', id: id },
        include: { asset: true, request: true },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateProcurementStatus(
  assetId: string,
  orderedQuantity: number, // quantity you’re marking as ordered
) {
  try {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) throw new BadRequestException('Asset not found');

    // 🔍 Get all items needing procurement for this asset
    const items = await this.prisma.assetRequestItem.findMany({
      where: {
        assetId,
        procurementStatus: 'REQUIRED',
      },
    });

    if (items.length === 0)
      throw new BadRequestException('No items needing procurement for this asset');

    // 🧮 Total quantity still needed
    const totalNeeded = items.reduce(
      (sum, item) => sum + (item.quantity - (item.quantityIssued || 0)),
      0,
    );

    // 🧩 Determine status
    const isFullyOrdered = orderedQuantity >= totalNeeded;

const status = isFullyOrdered
  ? ProcurementStatus.ORDERED
  : ProcurementStatus.PARTIALLY_ORDERED;

await this.prisma.assetRequestItem.updateMany({
  where: { assetId },
  data: { procurementStatus: status },
});

    // 📦 Update asset quantity
    const newQty = Number(asset.quantity) + orderedQuantity;
    const updatedAsset = await this.prisma.asset.update({
      where: { id: assetId },
      data: { quantity: String(newQty) },
    });

    // 🔔 Emit real-time update
    this.assetGateway.emitProcurementUpdated(assetId, {
      assetId,
      status: isFullyOrdered ? 'ORDERED' : 'PARTIALLY_ORDERED',
      orderedQuantity,
      totalNeeded,
      newQuantity: newQty,
    });

    return {
      message: isFullyOrdered
        ? 'Asset fully ordered and updated successfully'
        : 'Asset partially ordered',
      asset: updatedAsset,
      orderedQuantity,
      totalNeeded,
      newQuantity: newQty,
    };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  // Reject request
  async reject(id: string) {
    try {
      const request = await this.prisma.assetRequest.findUnique({
        where: { id },
      });
      if (!request) throw new BadRequestException('Request not found');
      if (request.status !== 'PENDING')
        throw new BadRequestException('Request not pending');

      const updatedRequest = await this.prisma.assetRequest.update({
        where: { id },
        data: { status: 'REJECTED' },
      });

      this.assetGateway.emitRequestStatusChanged(id, 'REJECTED');

      return updatedRequest;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
