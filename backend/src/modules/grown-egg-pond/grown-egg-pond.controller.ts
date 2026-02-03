import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { GrownEggPondService } from './grown-egg-pond.service';

@Controller('grown-egg-ponds')
export class GrownEggPondController {
  constructor(private readonly service: GrownEggPondService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
