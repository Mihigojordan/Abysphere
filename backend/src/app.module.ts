import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AdminModule } from './modules/admin-management/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentModule } from './modules/department/department.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ContractModule } from './modules/contract/contract.module';
import { JobModule } from './modules/job-management/job.module';
import { ApplicantModule } from './modules/applicants-management/applicant.module';
import { EmailModule } from './global/email/email.module';
import { ClientModule } from './modules/client-management/client.module';

import { ActivityModule } from './modules/activity-management/activity.module';
import { AssetModule } from './modules/assets-management/asset.module';
import { SiteModule } from './modules/site-management/site.module';
import { CageModule } from './modules/cage-management/cage.module';
import { StoreModule } from './modules/store-management/store.module';
import { MedicationModule } from './modules/medication-management/medication.module';

import { AssetRequestModule } from './modules/asset-requisition-managment/request.module';
import { StockModule } from './modules/stockin-management/stock.module';
import { ParentFishPoolModule } from './modules/parent-fish-pool/parent-fish-pool.module';
import { FeedstockModule } from './modules/feedstock-management/feedstock.module';
import { ParentFishFeedingModule } from './modules/parent-fish-feeding-management/parent-fish-feeding.module';
import { MedicineModule } from './modules/medecine-stock-management/medecine.module';
import { ParentWaterChangingModule } from './modules/parent-water-changing/parent-water-changing.module';
import { ParentFishMedicationModule } from './modules/parent-fish-medication-management/parent-fish-medication.module';
import { LaboratoryBoxModule } from './modules/Laboratory-Box-Management/laboratory-box.module';
import { ParentEggMigrationModule } from './modules/parent-egg-migration/parent-egg-migration.module';
import { EggFishMedicationModule } from './modules/egg-fish-medication-management/egg-fish-medication.module';
import { LaboratoryBoxWaterChangingModule } from './modules/box-water-changing-management/box-water-changing.module';
import { EggFishFeedingModule } from './modules/egg-fish-feeding/egg-fish-feeding.module';
import { GrownEggPondModule } from './modules/grown-egg-pond/grown-egg-pond.module';
import { EggToPondMigrationModule } from './modules/egg-to-pond-migration/egg-to-pond-migration.module';
import { GrownEggPondFeedingModule } from './modules/grown-egg-pond-feeding/grown-egg-pond-feeding.module';
import { FeedCageModule } from './modules/feed/feed-cage.module';
import { PondWaterChangingModule } from './modules/pond-water-changing-management/pond-water-changing.module';
import { PondMedicationModule } from './modules/pond-medication-management/pond-medication.module';

@Module({
  imports: [
    AdminModule,
    PrismaModule,
    DepartmentModule,
    EmployeeModule,
    ContractModule,
    JobModule,
    ApplicantModule,
    EmailModule,
    ClientModule,
    ActivityModule,
    AssetModule,
    SiteModule,
    CageModule,
    StoreModule,
    MedicationModule,
    FeedCageModule,
    AssetRequestModule,
    StockModule,
    FeedstockModule,
    MedicineModule,
    ParentFishPoolModule,
    ParentFishFeedingModule,
    ParentWaterChangingModule,
    ParentFishMedicationModule,
    LaboratoryBoxModule,
    ParentEggMigrationModule,
    EggFishMedicationModule,
    LaboratoryBoxWaterChangingModule,
    EggFishFeedingModule,
    GrownEggPondModule,
    EggToPondMigrationModule,
    GrownEggPondFeedingModule,
    PondWaterChangingModule,
    PondMedicationModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
