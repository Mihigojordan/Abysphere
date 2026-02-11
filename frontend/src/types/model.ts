
// 1. ======/=> EMPOLOYEE <=/========
// Interface for employee data (used for validation)
export const EMPLOYEE_STATUS = ['ACTIVE', 'TERMINATED', 'RESIGNED', 'PROBATION'] as const;
export const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type ContractType = 'PERMANENT' | 'TEMPORARY' | 'INTERNSHIP';

export type EmployeeStatus = typeof EMPLOYEE_STATUS[number];
export type Gender = typeof GENDERS[number];

export interface EmployeeData {
    first_name?: string;
    last_name?: string;
    gender?: Gender;
    phone?: string;
    email: string;
    national_id?: string;
    position?: string;
    department?: string;
    date_hired?: string;
    status?: EmployeeStatus;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    profile_picture?: string;
}

// Interface for employee (includes additional fields like id and timestamps)
export interface Employee extends EmployeeData {
    profile_image?: string;
    id: string;
    isLocked?: boolean;
    google_id?: boolean;
    is2FA?: boolean;
    contract?: Contract; // Assuming one-to-one relationship for simplicity
    created_at?: string; // ISO string
    updated_at?: string; // ISO string
}

// ========================================================================================================

// 2. ======/=> CONTRACT <=/========

// Interface for contract data (used for create/update payloads)
// Contract data for creating/updating
export interface ContractData {
    contractType: ContractType;
    startDate: string;           // ISO string
    endDate?: string;            // optional ISO string
    salary: number;              // numeric value
    currency?: string;           // optional, default RWF
    benefits?: string;           // optional
    workingHours?: string;       // optional
    probationPeriod?: string;    // optional
    terminationConditions?: string; // optional
    terms?: string;              // optional
    employeeId: string;      // array of employee IDs assigned to this contract
}

// Contract interface for data coming from backend
export interface Contract extends ContractData {
    id: string;
    createdAt?: string;
    updatedAt?: string;
}




// ========================================================================================================

// 3. ======/=> JOB <=/========

// Interface for Job
export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  industry?: string;
  companyId?: number;
  skills_required?: string[];
  status?: string;
  applicants?:Applicant[];
  posted_at?: string; // ISO string
  expiry_date?: string; // ISO string
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
}

// CreateJobInput: Job without id, created_at, updated_at
export type CreateJobInput = Omit<Job, 'id' | 'created_at' | 'updated_at'>;

// UpdateJobInput: Partial of CreateJobInput (all fields optional)
export type UpdateJobInput = Partial<CreateJobInput>;

// ========================================================================================================

// 4. ======/=> Applicant <=/========


type ApplicationStage =
   'APPLIED'|
 'SHORTLISTED'|
  'INTERVIEWED'|
 'HIRED'|
  'REJECTED';


export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  skills?: any; // JSON can be typed more strictly if desired, e.g., string[]
  experienceYears?: number;
  stage: ApplicationStage;
  created_at: string; // or Date if you parse it
  updated_at: string; // or Date
}

// ========================================================================================================

// 5. ======/=> Client <=/========
export interface Client {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  profileImage?: string | null;
  createdAt: string; // ISO date string from backend
  updatedAt: string; // ISO date string from backend
}


// site interface

export interface Site {
  id: string;
  siteCode: string;
  name: string;
  location: string;
  siteImg?: string;
  managerId?: string;
  supervisorId?: string;
  manager?: Employee;
  supervisor?: Employee;
  employees?: Employee[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteData {
  siteCode: string;
  name: string;
  location: string;
  siteImg?: string;
  managerId?: string;
  supervisorId?: string;
}