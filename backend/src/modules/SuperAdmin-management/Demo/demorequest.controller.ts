import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { DemoRequestService } from './demorequest.service';

@Controller('demo-requests')
export class DemoRequestController {
  constructor(private readonly demoRequestService: DemoRequestService) {}

  @Post()
  create(@Body() body: any) {
    return this.demoRequestService.create(body);
  }

  @Get()
  findAll() {
    return this.demoRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demoRequestService.findOne(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.demoRequestService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demoRequestService.remove(Number(id));
  }
}
