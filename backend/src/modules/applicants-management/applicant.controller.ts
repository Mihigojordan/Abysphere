import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantFileFields, ApplicantUploadConfig } from 'src/common/utils/file-upload.utils';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApplicantGateway } from './applicant.gateway';

@Controller('applicants')
export class ApplicantController {
  constructor(
    private readonly applicantService: ApplicantService,
     private readonly applicantGateway: ApplicantGateway,
  ) { }
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(ApplicantFileFields, ApplicantUploadConfig),
  )
  async create(
    @UploadedFiles()
    files: {
      cvFile?: Express.Multer.File[];
    },
    @Body() body: any,

  ) {
    try {
      if (files?.cvFile?.[0]?.filename) {
        body.cvUrl = `/uploads/cv_files/${files.cvFile[0].filename}`;
      }
      const applicant = await this.applicantService.create(body);
      this.applicantGateway.emitApplicantCreated(applicant);
      return applicant

    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.applicantService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.applicantService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  async update(
    @UploadedFiles()
    files: {
      cvFile?: Express.Multer.File[];
    },
    @Param('id') id: string,
    @Body() body: any) {
    try {

      if (files?.cvFile?.[0]?.filename) {
        body.cvUrl = `/uploads/cv_files/${files.cvFile[0].filename}`;
      }
      const applicant =  await this.applicantService.update(id, body);
      this.applicantGateway.emitApplicantUpdated(applicant);
      return applicant
    } catch (error) {
      throw error;
    }
  }
  @Put('/status/:id')
  async updateStage(
    @UploadedFiles()
    files: {
      cvFile?: Express.Multer.File[];
    },
    @Param('id') id: string,
    @Body() body: any) {
    try {

      if (files?.cvFile?.[0]?.filename) {
        body.cvUrl = `/uploads/cv_files/${files.cvFile[0].filename}`;
      }
      const applicant =  await this.applicantService.updateStage(id, body);
      this.applicantGateway.emitApplicantUpdated(applicant);
      return applicant
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
    const  applicant = await this.applicantService.remove(id);
    this.applicantGateway.emitApplicantDeleted(id);
      return applicant
    } catch (error) {
      throw error;
    }
  }
}
