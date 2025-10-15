import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { FeedCageService } from './feed-cage.service';
import { EmployeeJwtAuthGuard } from 'src/guards/employeeGuard.guard';
import { RequestWithEmployee } from 'src/common/interfaces/employee.interface';

@Controller('feed-cages')
export class FeedCageController {
  constructor(private readonly feedCageService: FeedCageService) {}

  @Post()
  @UseGuards(EmployeeJwtAuthGuard)
 async create(@Body() body: any, @Req() req: RequestWithEmployee) {
    body.employeeId = req.employee.id;
    try {
      
      return await this.feedCageService.create(body);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.feedCageService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('cage/:id')
  async findAllByCageId(@Param('id') id: string) {
    try {
      return await this.feedCageService.findAllByCageId(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.feedCageService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    try {
      return await this.feedCageService.update(id, data);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.feedCageService.remove(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
