import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, User, FileText, Briefcase, Upload, X, Eye, Calendar, Plus, Trash2, Save, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import departmentService from '../../../services/departmentService';
import { API_URL } from '../../../api/api';
import Swal from 'sweetalert2';

const MARITAL_STATUS = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] as const;
const EMPLOYEE_STATUS = ['ACTIVE', 'TERMINATED', 'RESIGNED', 'PROBATION'] as const;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

type MaritalStatus = typeof MARITAL_STATUS[number];
type EmployeeStatus = typeof EMPLOYEE_STATUS[number];
type Gender = typeof GENDERS[number];

interface Department {
  id: string;
  name: string;
}

interface Experience {
  company_name: string;
  description: string;
  start_date: string;
  end_date?: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  national_id: string;
  position: string;
  departmentId: string;
  marital_status: MaritalStatus;
  date_hired: string;
  status: EmployeeStatus;
  bank_account_number: string;
  bank_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  experience: Experience[];
  profile_picture?: string;
  application_letter?: string;
  cv?: string;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  national_id: string;
  position: string;
  departmentId: string;
  marital_status: MaritalStatus;
  date_hired: string;
  status: EmployeeStatus;
  bank_account_number: string;
  bank_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  experience: Experience[];
}

interface FileState {
  profileImg: File | null;
  applicationLetter: File | null;
  cv: File | null;
}

interface PreviewFileState {
  profileImg: string | null;
  applicationLetter: string | null;
  cv: string | null;
}

interface RemovedFileState {
  profileImg: boolean;
  applicationLetter: boolean;
  cv: boolean;
}

interface Errors {
  [key: string]: string | null;
}

interface Step {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EmployeeForm: React.FC<{
  employeeId?: string;
  onSuccess?: (response: Employee) => void;
  onCancel?: () => void;
}> = ({ employeeId, onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [previewFiles, setPreviewFiles] = useState<PreviewFileState>({
    profileImg: null,
    applicationLetter: null,
    cv: null,
  });
  const [existingFiles, setExistingFiles] = useState<PreviewFileState>({
    profileImg: null,
    applicationLetter: null,
    cv: null,
  });
  const [removedFiles, setRemovedFiles] = useState<RemovedFileState>({
    profileImg: false,
    applicationLetter: false,
    cv: false,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    gender: '' as Gender,
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    national_id: '',
    position: '',
    departmentId: '',
    marital_status: 'SINGLE',
    date_hired: '',
    status: 'ACTIVE',
    bank_account_number: '',
    bank_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    experience: [],
  });
  const [files, setFiles] = useState<FileState>({
    profileImg: null,
    applicationLetter: null,
    cv: null,
  });

  const steps: Step[] = [
    { title: 'Personal Info', icon: User },
    { title: 'Documents', icon: FileText },
    { title: 'Experience', icon: Briefcase },
    { title: 'Review', icon: Check },
  ];

  const navigate = useNavigate();
  const { id: paramsEmployeeId } = useParams<{ id?: string }>();

  const getUrlImage = (url: string | undefined): string | undefined => {
    if (!url) return url;
    if (url.includes('http')) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    loadDepartmentData();
    if (employeeId || paramsEmployeeId) {
      loadEmployeeData();
    }
  }, [employeeId, paramsEmployeeId]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      const id = employeeId || paramsEmployeeId;
      if (!id) return;
      const employee = await employeeService.getEmployeeById(id);
      if (employee) {
        const parsedExperience: Experience[] = typeof employee.experience === 'string'
          ? JSON.parse(employee.experience)
          : employee.experience || [];

        setFormData({
          ...employee,
          date_of_birth: new Date(employee.date_of_birth).toISOString().split('T')[0],
          date_hired: new Date(employee.date_hired).toISOString().split('T')[0],
          bank_account_number: employee.bank_account_number || '',
          bank_name: employee.bank_name || '',
          emergency_contact_name: employee.emergency_contact_name || '',
          emergency_contact_phone: employee.emergency_contact_phone || '',
          experience: parsedExperience,
        });

        setExistingFiles({
          profileImg: getUrlImage(employee.profile_picture) || null,
          applicationLetter: getUrlImage(employee.application_letter) || null,
          cv: getUrlImage(employee.cv) || null,
        });

        setPreviewFiles({
          profileImg: getUrlImage(employee.profile_picture) || null,
          applicationLetter: getUrlImage(employee.application_letter) || null,
          cv: getUrlImage(employee.cv) || null,
        });
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      setErrors({ general: 'Failed to load employee data' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartmentData = async () => {
    try {
      setIsLoading(true);
      const departmentData = await departmentService.getAllDepartments();
      setDepartments(departmentData || []);
    } catch (error) {
      console.error('Error loading department:', error);
      setErrors({ general: 'Failed to load department data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (fileType: keyof FileState, file: File | null) => {
    setFiles(prev => ({ ...prev, [fileType]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewFiles(prev => ({ ...prev, [fileType]: e.target?.result as string }));
      };
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        setPreviewFiles(prev => ({ ...prev, [fileType]: file.name }));
      }
      setRemovedFiles(prev => ({ ...prev, [fileType]: false }));
    } else {
      if (existingFiles[fileType] && !removedFiles[fileType]) {
        setPreviewFiles(prev => ({ ...prev, [fileType]: existingFiles[fileType] }));
      } else {
        setPreviewFiles(prev => ({ ...prev, [fileType]: null }));
      }
    }

    if (errors[fileType]) {
      setErrors(prev => ({ ...prev, [fileType]: null }));
    }
  };

  const removeFile = (fileType: keyof FileState) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
    setPreviewFiles(prev => ({ ...prev, [fileType]: null }));
    if (existingFiles[fileType]) {
      setRemovedFiles(prev => ({ ...prev, [fileType]: true }));
    }
    if (errors[fileType]) {
      setErrors(prev => ({ ...prev, [fileType]: null }));
    }
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company_name: '',
        description: '',
        start_date: '',
        end_date: '',
      }],
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    switch (step) {
      case 0: // Personal Info
        if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
        if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.national_id.trim()) newErrors.national_id = 'National ID is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (!formData.departmentId.trim()) newErrors.departmentId = 'Department is required';
        if (!formData.date_hired) newErrors.date_hired = 'Hire date is required';
        if (formData.emergency_contact_phone && !/^\+?\d{10,15}$/.test(formData.emergency_contact_phone)) {
          newErrors.emergency_contact_phone = 'Invalid emergency contact phone format';
        }
        if (formData.bank_account_number && !/^\d{8,20}$/.test(formData.bank_account_number)) {
          newErrors.bank_account_number = 'Invalid bank account number format';
        }
        break;

      case 1: // Documents
        if (!(employeeId || paramsEmployeeId) && !files.applicationLetter && !existingFiles.applicationLetter) {
          newErrors.applicationLetter = 'Application letter is required';
        }
        if ((employeeId || paramsEmployeeId) && existingFiles.applicationLetter && removedFiles.applicationLetter && !files.applicationLetter) {
          newErrors.applicationLetter = 'Application letter is required';
        }
        if (files.applicationLetter && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(files.applicationLetter.type)) {
          newErrors.applicationLetter = 'Application letter must be a document (PDF, DOC, DOCX)';
        }
        break;

      case 2: // Experience
        formData.experience.forEach((exp, index) => {
          if (!exp.company_name.trim()) {
            newErrors[`experience_${index}_company`] = 'Company name is required';
          }
          if (!exp.description.trim()) {
            newErrors[`experience_${index}_description`] = 'Description is required';
          }
          if (!exp.start_date) {
            newErrors[`experience_${index}_start_date`] = 'Start date is required';
          }
          if (exp.start_date && exp.end_date && new Date(exp.start_date) > new Date(exp.end_date)) {
            newErrors[`experience_${index}_date_range`] = 'Start date must be before end date';
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const createFormData = (): globalThis.FormData => {
    const data = new FormData();
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'experience') {
        data.append(key, JSON.stringify(value));
      } else {
        data.append(key, value as string);
      }
    });

    if (files.profileImg) data.append('profileImg', files.profileImg);
    if (files.applicationLetter) data.append('applicationLetter', files.applicationLetter);
    if (files.cv) data.append('cv', files.cv);

    const removedFilesList = Object.entries(removedFiles)
      .filter(([_, removed]) => removed)
      .reduce((acc, [fileType, _]) => ({ ...acc, [fileType]: true }), {});
      
    if (Object.keys(removedFilesList).length > 0) {
      data.append('removedFiles', JSON.stringify(removedFilesList));
    }

    return data;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsLoading(true);
      const submitData = createFormData();

      let response: Employee;
      const id = employeeId || paramsEmployeeId;
      if (id) {
        response = await employeeService.updateEmployee(id, submitData);
      } else {
        response = await employeeService.createEmployee(submitData);
      }

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const FileUpload: React.FC<{
    label: string;
    fileType: keyof FileState;
    accept: string;
    required?: boolean;
  }> = ({ label, fileType, accept, required = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && !existingFiles[fileType] && !removedFiles[fileType] && <span className="text-red-500">*</span>}
      </label>
      
      {(!files[fileType] && (!existingFiles[fileType] || removedFiles[fileType])) ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(fileType, e.target.files?.[0] || null)}
            className="hidden"
            id={fileType}
          />
          <label htmlFor={fileType} className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Click to upload {label.toLowerCase()}</p>
            <p className="text-sm text-gray-500">{accept}</p>
            {existingFiles[fileType] && removedFiles[fileType] && (
              <p className="text-sm text-red-500 mt-1">Existing file will be removed</p>
            )}
          </label>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {files[fileType]?.name || existingFiles[fileType]?.split('/').pop() || 'File'}
                  {existingFiles[fileType] && !files[fileType] && (
                    <span className="ml-2 text-sm text-primary-500">(Existing)</span>
                  )}
                </p>
                {files[fileType] && (
                  <p className="text-sm text-gray-500">
                    {(files[fileType]!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {previewFiles[fileType] && (
                <button
                  type="button"
                  onClick={() => window.open(previewFiles[fileType]!)}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeFile(fileType)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          {previewFiles[fileType] && (
            <div className="mt-3">
              {fileType === 'profileImg' ? (
                <img src={previewFiles[fileType]!} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
              ) : (
                <p className="text-sm text-gray-500">Preview available in new tab</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {errors[fileType] && (
        <p className="text-sm text-red-600">{errors[fileType]}</p>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.first_name && <p className="text-sm text-red-600 mt-1">{errors.first_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.last_name && <p className="text-sm text-red-600 mt-1">{errors.last_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value as Gender)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.national_id}
                  onChange={(e) => handleInputChange('national_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.national_id && <p className="text-sm text-red-600 mt-1">{errors.national_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.position && <p className="text-sm text-red-600 mt-1">{errors.position}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && <p className="text-sm text-red-600 mt-1">{errors.departmentId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select
                  value={formData.marital_status}
                  onChange={(e) => handleInputChange('marital_status', e.target.value as MaritalStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {MARITAL_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Hired <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_hired}
                  onChange={(e) => handleInputChange('date_hired', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.date_hired && <p className="text-sm text-red-600 mt-1">{errors.date_hired}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as EmployeeStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EMPLOYEE_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={formData.bank_account_number}
                  onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.bank_account_number && <p className="text-sm text-red-600 mt-1">{errors.bank_account_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.emergency_contact_phone && <p className="text-sm text-red-600 mt-1">{errors.emergency_contact_phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
            </div>
          </div>
        );

      case 1: // Documents
        return (
          <div className="space-y-6">
            <FileUpload
              label="Profile Picture"
              fileType="profileImg"
              accept="image/*"
            />
            
            <FileUpload
              label="Application Letter"
              fileType="applicationLetter"
              accept=".pdf,.doc,.docx"
              required={!(employeeId || paramsEmployeeId)}
            />
            
            <FileUpload
              label="CV/Resume"
              fileType="cv"
              accept=".pdf,.doc,.docx"
            />
          </div>
        );

      case 2: // Experience
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Work Experience</h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Experience</span>
              </button>
            </div>

            {formData.experience.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm">No work experience added yet.</p>
                <p className="text-sm">Click "Add Experience" to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Experience {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={exp.company_name}
                          onChange={(e) => updateExperience(index, 'company_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors[`experience_${index}_company`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_company`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors[`experience_${index}_start_date`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_start_date`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={exp.end_date || ''}
                          onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors[`experience_${index}_date_range`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_date_range`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Describe your role and responsibilities..."
                      />
                      {errors[`experience_${index}_description`] && (
                        <p className="text-sm text-red-600 mt-1">{errors[`experience_${index}_description`]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-gray-900">Review Information</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Personal Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.first_name} {formData.last_name}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                  <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                  <p><span className="font-medium">Position:</span> {formData.position}</p>
                  <p><span className="font-medium">Status:</span> {formData.status}</p>
                  <p><span className="font-medium">Marital Status:</span> {formData.marital_status}</p>
                  <p><span className="font-medium">Date of Birth:</span> {formData.date_of_birth}</p>
                  <p><span className="font-medium">National ID:</span> {formData.national_id}</p>
                  <p><span className="font-medium">Date Hired:</span> {formData.date_hired}</p>
                  <p><span className="font-medium">Bank Name:</span> {formData.bank_name || 'Not provided'}</p>
                  <p><span className="font-medium">Bank Account Number:</span> {formData.bank_account_number || 'Not provided'}</p>
                  <p><span className="font-medium">Emergency Contact Name:</span> {formData.emergency_contact_name || 'Not provided'}</p>
                  <p><span className="font-medium">Emergency Contact Phone:</span> {formData.emergency_contact_phone || 'Not provided'}</p>
                  <p className="col-span-2"><span className="font-medium">Address:</span> {formData.address}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-1 text-sm">
                  <p>Profile Picture: {files.profileImg?.name || (existingFiles.profileImg && !removedFiles.profileImg ? existingFiles.profileImg.split('/').pop() : 'Not uploaded')}</p>
                  <p>Application Letter: {files.applicationLetter?.name || (existingFiles.applicationLetter && !removedFiles.applicationLetter ? existingFiles.applicationLetter.split('/').pop() : 'Not uploaded')}</p>
                  <p>CV: {files.cv?.name || (existingFiles.cv && !removedFiles.cv ? existingFiles.cv.split('/').pop() : 'Not uploaded')}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Experience ({formData.experience.length} entries)</h4>
                {formData.experience.length === 0 ? (
                  <p className="text-sm text-gray-500">No experience added</p>
                ) : (
                  <div className="space-y-2">
                    {formData.experience.map((exp, index) => (
                      <p key={index} className="text-sm">
                        {exp.company_name} ({exp.start_date} - {exp.end_date || 'Present'})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="bg-primary-500 px-6 py-4">
        <h1 className="text-xl font-semibold text-white">
          {(employeeId || paramsEmployeeId) ? 'Update Employee' : 'Create New Employee'}
        </h1>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index === currentStep
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : index < currentStep
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-2">
                  <p className={`text-sm font-medium ${
                    index === currentStep ? 'text-primary-600' : 
                    index < currentStep ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    index < currentStep ? 'bg-primary-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-6">
        {renderStepContent()}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : ((employeeId || paramsEmployeeId) ? 'Update Employee' : 'Create Employee')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeFormExample: React.FC <{role:string}> = ({role})  => {
  const [showForm, setShowForm] = useState<boolean>(true);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSuccess = (response: Employee) => {
    Swal.fire({
      title: "Success!",
      text: "Employee has been saved successfully.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#ff7300"
    }).then(() => {
      navigate("/admin/dashboard/employee-management", { replace: true });
    });
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Cancelling",
      text: "Are you sure you want to cancel? Unsaved changes will be lost",
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#999"
    }).then(() => {
      navigate("/admin/dashboard/employee-management", { replace: true });
    });
  };

  const handleEdit = (employeeId: string) => {
    setEditingEmployeeId(employeeId);
    setShowForm(true);
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="mb-4">
              <Check className="mx-auto h-12 w-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Employee {editingEmployeeId ? 'Updated' : 'Created'} Successfully!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The employee information has been saved to the system.
            </p>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setEditingEmployeeId(null);
                  setShowForm(true);
                }}
                className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create Another Employee
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go Back to Form
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6">
      <div className="w-full mx-auto px-4">
        <EmployeeForm
          employeeId={editingEmployeeId!}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EmployeeFormExample;