import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AdminJwtAuthGuard } from '../../guards/adminGuard.guard';
import { RequestWithAdmin } from '../../common/interfaces/admin.interface';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(AdminJwtAuthGuard)
  @Post()
create(@Req() req: RequestWithAdmin, @Body() body: any) {
  return this.activityService.create(body, req.admin!.id); // 👈 use !
}

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }
@UseGuards(AdminJwtAuthGuard)
@Patch(':id')
update(
  @Req() req: RequestWithAdmin,
  @Param('id') id: string,
  @Body() body: any,
) {
  return this.activityService.update(+id, body, req.admin!.id); // 👈 use !
}

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityService.remove(+id);
  }
}
