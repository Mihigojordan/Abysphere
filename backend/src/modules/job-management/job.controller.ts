// src/job/job.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { JobService } from './job.service';
import { JobGateway } from './job.gateway';


@Controller('jobs')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly jobGateway: JobGateway,
  ) { }

  @Post()
  async create(
    @Body()
    body: {
      title: string;
      description: string;
      location: string;
      employment_type: string;
      experience_level: string;
      industry?: string;
      companyId?: number;
      skills_required?: any;
      status?: string;
      posted_at?: Date;
      expiry_date?: Date;
    },
  ) {
    try {
       const createdJob = await this.jobService.create(body);
      this.jobGateway.emitJobCreated(createdJob);
      return createdJob;
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.jobService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.jobService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      location?: string;
      employment_type?: string;
      experience_level?: string;
      industry?: string;
      companyId?: number;
      skills_required?: any;
      status?: string;
      posted_at?: Date;
      expiry_date?: Date;
    },
  ) {
    try {
      const updatedJob = await this.jobService.update(id, body);
      this.jobGateway.emitJobUpdated(updatedJob);
      return updatedJob;

    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const deletedJob = await this.jobService.remove(id);
      this.jobGateway.emitJobUpdated(id);
      return deletedJob;
    } catch (error) {
      throw error;
    }
  }
}
