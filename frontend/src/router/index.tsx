/* eslint-disable react-refresh/only-export-components */
import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AuthLayout from "../layout/AuthLayout";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectPrivateAdminRoute from "../components/protectors/ProtectPrivateAdminRoute";
import ProtectPrivateEmployeeRoute from "../components/protectors/ProtectPrivateEmployeeRoute";
import logo from "../assets/fine_fish_logo.png";
import FeedstockDashboard from "../pages/dashboard/FeedstockDashboard";
import ParentFishPoolManagement from "../pages/dashboard/ParentFishPoolManagement";
import ParentFishFeedingManagement from "../pages/dashboard/ParentFishFeedingManagement";
import ParentWaterChangingManagement from "../pages/dashboard/ParentWaterChangingManagement";
import ParentFishMedicationManagement from "../pages/dashboard/ParentFishMedicationManagement";
import ParentEggMigrationManagement from "../pages/dashboard/ParentEggMigrationManagement";
import EggFishFeedingManagement from "../pages/dashboard/EggFishFeedingManagement";
import GrownEggPondManagement from "../pages/dashboard/GrownEggPondManagement";
import EggToPondMigrationManagement from "../pages/dashboard/EggToPondMigrationManagement";
import GrownEggPondFeedingManagement from "../pages/dashboard/GrownEggPondFeedingManagement";

// ✅ Lazy-loaded components
const Home = lazy(() => import("../pages/landing/Home"));
const BlogsPage = lazy(() => import("../pages/landing/BlogsPage"));
const BlogViewPage = lazy(() => import("../components/landing/BlogViewPage"));
const AdminLogin = lazy(() => import("../pages/auth/admin/Login"));
const UnlockScreen = lazy(() => import("../pages/auth/admin/UnlockScreen"));
const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
const AdminProfile = lazy(() => import("../pages/dashboard/admin/AdminProfile"));
const EmployeeDashboard = lazy(() => import("../pages/dashboard/EmployeeDashboard"));
const EmployeeFormExample = lazy(() => import("../components/dashboard/employee/EmployeeForm"));
const ContractDashboard = lazy(() => import("../pages/dashboard/ContractManagement"));
const ViewEmployee = lazy(() => import("../components/dashboard/employee/EmployeeViewMorePage"));
const RecruitementManagement = lazy(() => import("../pages/dashboard/RecruitementManagement"));
const UpserJobPost = lazy(() => import("../components/dashboard/recruitment/UpsertJobPost"));
const JobView = lazy(() => import("../components/dashboard/recruitment/JobView"));
const JobBoard = lazy(() => import("../pages/landing/JobBoard"));
const JobPostView = lazy(() => import("../components/landing/JobViewPage"));
const JobApplicationForm = lazy(() => import("../components/landing/ApplyJob"));
const ApplicantView = lazy(() => import("../components/dashboard/recruitment/ApplicantView"));
const ClientManagement = lazy(() => import("../pages/dashboard/ClientManagement"));
const AssetManagement = lazy(() => import("../pages/dashboard/AssetManagement"));
const AddAssetPage = lazy(() => import("../components/dashboard/asset/AddAssetPage"));
const EditAssetPage = lazy(() => import("../components/dashboard/asset/EditAssetPage"));
const AssetViewPage = lazy(() => import("../components/dashboard/asset/AssetViewPage"));
const EmployeeLogin = lazy(() => import("../pages/auth/employee/EmployeeLogin"));
const EmployeeUnlockScreen = lazy(() => import("../pages/auth/employee/EmployeeUnlockScreen"));
const EmployeeProfilePage = lazy(() => import("../pages/dashboard/employee/EmployeeProfilePage"));
const StoreManagement = lazy(() => import("../pages/dashboard/StoreManagement"));
const StoreFormExample = lazy(() => import("../components/dashboard/store/StoreForm"));
const StoreViewPage = lazy(() => import("../components/dashboard/store/StoreViewMorePage"));
const CageManagement = lazy(() => import("../pages/dashboard/CageManagement"));
const CageForm = lazy(() => import("../components/dashboard/cage/CageForm"));
const CageViewPage = lazy(() => import("../components/dashboard/cage/CageViewMorePage"));
const MedicationForm = lazy(() => import("../components/dashboard/cage/MedicationForm"));
const DailyFeedRecordForm = lazy(() => import("../components/dashboard/cage/DailyFeedRecordForm"));
const CategoryManagement = lazy(() => import("../pages/dashboard/CategoryManagement"));
const StockManagement = lazy(() => import("../pages/dashboard/StockManagement"));
const StockInForm = lazy(() => import("../components/dashboard/stock/StockFormPage"));
const StockInViewPage = lazy(() => import("../components/dashboard/stock/StockInViewPage"));
const StockRequestManagement = lazy(() => import("../pages/dashboard/StockRequestManagement"));
const StockRequestManagementDetails = lazy(() => import("../pages/dashboard/StockRequestManagementDetails"));
const StockHistory = lazy(() => import("../pages/dashboard/StockHistory"));
const PrivacyPolicy = lazy(() => import("../pages/landing/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../pages/landing/TermsOfService"));
const ServiceAgreement = lazy(() => import("../pages/landing/ServiceAgreement"));
const DataProtection = lazy(() => import("../pages/landing/DataProtection"));
const EnvironmentalCompliance = lazy(() => import("../pages/landing/EnvironmentalCompliance"));

const ProductPage = lazy(() => import('../pages/landing/FeaturesPage'));
const ServicesPage = lazy(() => import('../pages/landing/ServicePage'));
const ContactPage = lazy(() => import('../pages/landing/ContactUs'));
const AboutPage = lazy(() => import('../pages/landing/AboutPage'));
const DepartmentDashboard = lazy(() => import('../pages/dashboard/DepartmentManagement'));
const SiteManagement = lazy(() => import('../pages/dashboard/SiteManagement')); 
const SiteAssignmentManagement = lazy(()=> import('../pages/dashboard/SiteAssignmentManagement'));
const AssetRequestManagement = lazy(() => import('../pages/dashboard/AssetRequestManagement'));
const RequestAssetsManagement = lazy(() => import('../pages/dashboard/admin/RequestedAssetsManagement'));
const ProcurementManagement = lazy(() => import('../pages/dashboard/ProcurementManagement'));
const MedicineManagement = lazy(() => import('../pages/dashboard/MedecineManagment'));
const LaboratoryBoxManagement = lazy(()=> import('../pages/dashboard/LaboratoryBoxManagement'))
const EggFishMedicationManagement = lazy(()=> import('../pages/dashboard/EggFishMedicationManagement'))
const BoxWaterChangingManagement = lazy(()=> import('../pages/dashboard/BoxWaterChangingManagement'))
const PondWaterChangingManagement = lazy(()=> import('../pages/dashboard/PondWaterChangingManagment'))
const PondMedicationManagement = lazy(()=> import('../pages/dashboard/PondMedicationManagement'))
/**
 * Loading spinner component for Suspense fallback
 */
const LoadingSpinner:React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <img src={logo} alt="Loading..." className="h-40 animate-zoomInOut" />
  </div>
);

/**
 * Suspense wrapper for lazy-loaded components
 * @param props - Component props with children
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
}

const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ children }) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

/**
 * Application routes configuration
 */
const routes = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <Home />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'about',
            element: (
              <SuspenseWrapper>
                <AboutPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'features',
            element: (
              <SuspenseWrapper>
                <ProductPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'solutions',
            element: (
              <SuspenseWrapper>
                <ServicesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs',
            element: (
              <SuspenseWrapper>
                <JobBoard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs',
            element: (
              <SuspenseWrapper>
                <JobBoard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs/:id',
            element: (
              <SuspenseWrapper>
                <JobPostView />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/jobs/apply-job/:id',
            element: (
              <SuspenseWrapper>
                <JobApplicationForm />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'contact',
            element: (
              <SuspenseWrapper>
                <ContactPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'blogs',
            element: (
              <SuspenseWrapper>
                <BlogsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'blogs/:id',
            element: (
              <SuspenseWrapper>
                <BlogViewPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'legal/privacy-policy',
            element: (
              <SuspenseWrapper>
                <PrivacyPolicy />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'legal/terms',
            element: (
              <SuspenseWrapper>
                <TermsOfService />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'legal/environmental',
            element: (
              <SuspenseWrapper>
                <EnvironmentalCompliance />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'legal/data-protection',
            element: (
              <SuspenseWrapper>
                <DataProtection />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'legal/service-agreement',
            element: (
              <SuspenseWrapper>
                <ServiceAgreement />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <SuspenseWrapper>
            <ProtectPrivateAdminRoute>
              <Outlet />
            </ProtectPrivateAdminRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardLayout role='admin' />,
            children: [
              {
                path: '',
                element: (
                  <SuspenseWrapper>
                    <DashboardHome role='admin'/>
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'profile',
                element: (
                  <SuspenseWrapper>
                    <AdminProfile  />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'department-management',
                element: (
                  <SuspenseWrapper>
                    <DepartmentDashboard role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management',
                element: (
                  <SuspenseWrapper>
                    <EmployeeDashboard role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/:id',
                element: (
                  <SuspenseWrapper>
                    <ViewEmployee role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/create',
                element: (
                  <SuspenseWrapper>
                    <EmployeeFormExample role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <EmployeeFormExample role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'contract-management',
                element: (
                  <SuspenseWrapper>
                    <ContractDashboard role='admin'/>
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management',
                element: (
                  <SuspenseWrapper>
                    <RecruitementManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/create',
                element: (
                  <SuspenseWrapper>
                    <UpserJobPost role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <UpserJobPost role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/:id',
                element: (
                  <SuspenseWrapper>
                    <JobView role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/:jobId/applicants/:applicantId',
                element: (
                  <SuspenseWrapper>
                    <ApplicantView role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'client-management',
                element: (
                  <SuspenseWrapper>
                    <ClientManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management',
                element: (
                  <SuspenseWrapper>
                    <AssetManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },
                 {
                path: 'FeedStock-management',
                element: (
                  <SuspenseWrapper>
                    <FeedstockDashboard  role="admin"  />
                  </SuspenseWrapper>
                ),
              },
                 {
                path: 'parent-fish-management',
                element: (
                  <SuspenseWrapper>
                   <ParentFishPoolManagement role="admin" />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'requestedAssets-management',
                element: (
                  <SuspenseWrapper>
                    <RequestAssetsManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'procurement-management',
                element: (
                  <SuspenseWrapper>
                    <ProcurementManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },              
              {
                path: 'asset-management/create',
                element: (
                  <SuspenseWrapper>
                    <AddAssetPage role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <EditAssetPage role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management/:id',
                element: (
                  <SuspenseWrapper>
                    <AssetViewPage  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path:'site-management',
                element:(
                  <SuspenseWrapper>
                    <SiteManagement role='admin'/>
                  </SuspenseWrapper>
                )
              },
              {
                path:'assign-management',
                element:(
                  <SuspenseWrapper>
                    <SiteAssignmentManagement role='admin'/>
                  </SuspenseWrapper>
                )
              },
              {
                path: 'store-management',
                element: (
                  <SuspenseWrapper>
                    <StoreManagement role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'store-management/create',
                element: (
                  <SuspenseWrapper>
                    <StoreFormExample role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'store-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <StoreFormExample role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'store-management/:id',
                element: (
                  <SuspenseWrapper>
                    <StoreViewPage  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'cage-management',
                element: (
                  <SuspenseWrapper>
                    <CageManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'cage-management/create',
                element: (
                  <SuspenseWrapper>
                    <CageForm role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <CageForm role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/view/:id',
                element: (
                  <SuspenseWrapper>
                    <CageViewPage  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/m/create',
                element: (
                  <SuspenseWrapper>
                    <MedicationForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/m/update/:id',
                element: (
                  <SuspenseWrapper>
                    <MedicationForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/f/create',
                element: (
                  <SuspenseWrapper>
                    <DailyFeedRecordForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/f/update/:id',
                element: (
                  <SuspenseWrapper>
                    <DailyFeedRecordForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'category-management',
                element: (
                  <SuspenseWrapper>
                    <CategoryManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management',
                element: (
                  <SuspenseWrapper>
                    <StockManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/create',
                element: (
                  <SuspenseWrapper>
                    <StockInForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <StockInForm  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/:id',
                element: (
                  <SuspenseWrapper>
                    <StockInViewPage  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-request',
                element: (
                  <SuspenseWrapper>
                    <StockRequestManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'stock-request/:id',
                element: (
                  <SuspenseWrapper>
                    <StockRequestManagementDetails  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'stock-history',
                element: (
                  <SuspenseWrapper>
                    <StockHistory  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'ParentFish-Feeding',
                element: (
                  <SuspenseWrapper>
                    <ParentFishFeedingManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-history/:id',
                element: (
                  <SuspenseWrapper>
                    <StockHistory  role='employee' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'Laboratory-Box-management',
                element: (
                  <SuspenseWrapper>
                    <LaboratoryBoxManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'parent-egg-migration',
                element: (
                  <SuspenseWrapper>
                    <ParentEggMigrationManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'egg-feed-management',
                element: (
                  <SuspenseWrapper>
                    <EggFishFeedingManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
                 {
                path: 'grown-egg-pond',
                element: (
                  <SuspenseWrapper>
                    <GrownEggPondManagement  role='admin' />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
         {
        path: 'employee',
        element: (
          <SuspenseWrapper>
            <ProtectPrivateEmployeeRoute>
              <Outlet />
            </ProtectPrivateEmployeeRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/employee/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardLayout role='employee' />,
            children: [
              {
                path: '',
                element: (
                  <SuspenseWrapper>
                    <DashboardHome role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'profile',
                element: (
                  <SuspenseWrapper>
                    <EmployeeProfilePage  />
                  </SuspenseWrapper>
                ),
              },
          
              {
                path: 'client-management',
                element: (
                  <SuspenseWrapper>
                    <ClientManagement role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management',
                element: (
                  <SuspenseWrapper>
                    <AssetManagement role='employee'/>
                  </SuspenseWrapper>
                ),
              },
                {
                path: 'ParentFish-Feeding',
                element: (
                  <SuspenseWrapper>
                    <ParentFishFeedingManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management/create',
                element: (
                  <SuspenseWrapper>
                    <AddAssetPage role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <EditAssetPage role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'asset-management/:id',
                element: (
                  <SuspenseWrapper>
                    <AssetViewPage  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management',
                element: (
                  <SuspenseWrapper>
                    <CageManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/create',
                element: (
                  <SuspenseWrapper>
                    <CageForm role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <CageForm role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/view/:id',
                element: (
                  <SuspenseWrapper>
                    <CageViewPage  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/m/create',
                element: (
                  <SuspenseWrapper>
                    <MedicationForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/m/update/:id',
                element: (
                  <SuspenseWrapper>
                    <MedicationForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/f/create',
                element: (
                  <SuspenseWrapper>
                    <DailyFeedRecordForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'cage-management/f/update/:id',
                element: (
                  <SuspenseWrapper>
                    <DailyFeedRecordForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
      
              {
                path: 'asset-request-management',
                element: (
                  <SuspenseWrapper>
                    <AssetRequestManagement  role='employee' />
                  </SuspenseWrapper>
                )
              },
               {
                path: 'category-management',
                element: (
                  <SuspenseWrapper>
                    <CategoryManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management',
                element: (
                  <SuspenseWrapper>
                    <StockManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/create',
                element: (
                  <SuspenseWrapper>
                    <StockInForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <StockInForm  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management/:id',
                element: (
                  <SuspenseWrapper>
                    <StockInViewPage  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-request',
                element: (
                  <SuspenseWrapper>
                    <StockRequestManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-request/:id',
                element: (
                  <SuspenseWrapper>
                    <StockRequestManagementDetails  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-history',
                element: (
                  <SuspenseWrapper>
                    <StockHistory  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-history/:id',
                element: (
                  <SuspenseWrapper>
                    <StockHistory  role='employee' />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'parent-fish-management',
                element: (
                  <SuspenseWrapper>
                   <ParentFishPoolManagement role="employee" />
                  </SuspenseWrapper>
                ),
              },
               {
                path: 'parent-water-changing',
                element: (
                  <SuspenseWrapper>
                   <ParentWaterChangingManagement role="employee" />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'medicine-management',
                element: (
                  <SuspenseWrapper>
                    <MedicineManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'Parent-Fish-medication-management',
                element: (
                  <SuspenseWrapper>
                    <ParentFishMedicationManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'Laboratory-Box-management',
                element: (
                  <SuspenseWrapper>
                    <LaboratoryBoxManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'parent-egg-migration',
                element: (
                  <SuspenseWrapper>
                    <ParentEggMigrationManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'egg-medication-management',
                element: (
                  <SuspenseWrapper>
                    <EggFishMedicationManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'box-water-changing-management',
                element: (
                  <SuspenseWrapper>
                    <BoxWaterChangingManagement  role='employee' />
                  </SuspenseWrapper>
                )
              },
              {
                path: 'egg-feed-management',
                element: (
                  <SuspenseWrapper>
                    <EggFishFeedingManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'grown-egg-pond',
                element: (
                  <SuspenseWrapper>
                    <GrownEggPondManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'egg-to-pond-migration',
                element: (
                  <SuspenseWrapper>
                    <EggToPondMigrationManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },

                {
                path: 'grown-egg-pond-feeding',
                element: (
                  <SuspenseWrapper>
                    <GrownEggPondFeedingManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },

              {
                path: 'pond-water-changing-management',
                element: (
                  <SuspenseWrapper>
                    <PondWaterChangingManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'pond-medication-management',
                element: (
                  <SuspenseWrapper>
                    <PondMedicationManagement  role='employee' />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'admin/login',
        element: (
          <SuspenseWrapper>
            <AdminLogin />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin/unlock',
        element: (
          <SuspenseWrapper>
            <UnlockScreen />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'employee/login',
        element: (
          <SuspenseWrapper>
            <EmployeeLogin />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'employee/unlock',
        element: (
          <SuspenseWrapper>
            <EmployeeUnlockScreen />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export default routes;