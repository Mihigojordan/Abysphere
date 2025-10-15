import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  FileText, 
  Settings,
  X,
  Plus,
  Trash2,
  Save,
  Check,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new'; // Import ReactQuill
import 'react-quill-new/dist/quill.snow.css'; // Import Quill styles
import jobService, { type CreateJobInput, type UpdateJobInput } from '../../../services/jobService';
import Swal from 'sweetalert2';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const;
const EXPERIENCE_LEVELS = ['ENTRY', 'MID', 'SENIOR', 'EXECUTIVE'] as const;
const JOB_STATUS = ['OPEN', 'CLOSED'] as const;
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 
  'Retail', 'Hospitality', 'Construction', 'Transportation', 'Media',
  'Legal', 'Consulting', 'Real Estate', 'Agriculture', 'Energy', 'Other'
] as const;

type EmploymentType = typeof EMPLOYMENT_TYPES[number];
type ExperienceLevel = typeof EXPERIENCE_LEVELS[number];
type JobStatus = typeof JOB_STATUS[number];
type Industry = typeof INDUSTRIES[number];

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  industry?: Industry;
  skills_required?: string[];
  status?: JobStatus;
  posted_at?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface JobFormData {
  title: string;
  description: string;
  location: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  industry: Industry;
  skills_required: string[];
  status: JobStatus;
  posted_at: string;
  expiry_date: string;
}

interface Errors {
  [key: string]: string | null;
}

interface Step {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const JobForm: React.FC<{
  jobId?: string;
  onSuccess?: (response: Job) => void;
  onCancel?: () => void;
  role:string;
}> = ({ jobId, onSuccess, onCancel, role }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [newSkill, setNewSkill] = useState<string>('');
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    location: '',
    employment_type: 'FULL_TIME',
    experience_level: 'ENTRY',
    industry: 'Technology',
    skills_required: [],
    status: 'OPEN',
    posted_at: new Date().toISOString().split('T')[0],
    expiry_date: '',
  });

  const steps: Step[] = [
    { title: 'Basic Info', icon: Briefcase },
    { title: 'Requirements', icon: FileText },
    { title: 'Settings', icon: Settings },
    { title: 'Review', icon: Check },
  ];

  const navigate = useNavigate();
  const { id: paramsJobId } = useParams<{ id?: string }>();

  useEffect(() => {
    if (jobId || paramsJobId) {
      loadJobData();
    }
  }, [jobId, paramsJobId]);

  const loadJobData = async () => {
    try {
      setIsLoading(true);
      const id = jobId || paramsJobId;
      if (!id) return;
      
      const job = await jobService.getJobById(id);
      if (job) {
        setFormData({
          title: job.title,
          description: job.description,
          location: job.location,
          employment_type: job.employment_type as EmploymentType,
          experience_level: job.experience_level as ExperienceLevel,
          industry: (job.industry as Industry) || 'Technology',
          skills_required: job.skills_required || [],
          status: (job.status as JobStatus) || 'DRAFT',
          posted_at: job.posted_at ? new Date(job.posted_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          expiry_date: job.expiry_date ? new Date(job.expiry_date).toISOString().split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Error loading job:', error);
      setErrors({ general: 'Failed to load job data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_required: [...prev.skills_required, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills_required: prev.skills_required.filter(skill => skill !== skillToRemove)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    switch (step) {
      case 0: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'Job title is required';
        else if (formData.title.length < 3) newErrors.title = 'Job title must be at least 3 characters';
        else if (formData.title.length > 100) newErrors.title = 'Job title must not exceed 100 characters';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
        if (!formData.experience_level) newErrors.experience_level = 'Experience level is required';
        break;

      case 1: // Requirements
        // Strip HTML tags for length validation
        const strippedDescription = formData.description.replace(/<[^>]+>/g, '');
        if (!strippedDescription.trim()) newErrors.description = 'Job description is required';
        else if (strippedDescription.length < 10) newErrors.description = 'Job description must be at least 50 characters';
        else if (strippedDescription.length > 5000) newErrors.description = 'Job description must not exceed 5000 characters';
        break;

      case 2: // Settings
        if (!formData.posted_at) newErrors.posted_at = 'Posted date is required';
        if (formData.expiry_date && new Date(formData.expiry_date) <= new Date(formData.posted_at)) {
          newErrors.expiry_date = 'Expiry date must be after posted date';
        }
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

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setIsLoading(true);
      
      const submitData: CreateJobInput | UpdateJobInput = {
        ...formData,
        title: formData.title,
        description: formData.description, // Rich text HTML content
        location: formData.location,
        employment_type: formData.employment_type,
        experience_level: formData.experience_level,
        industry: formData.industry,
        posted_at: formData.posted_at ? new Date(formData.posted_at).toISOString() : new Date().toISOString(),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : '',
        skills_required: formData.skills_required,
        status: formData.status,
      };

      let response: Job;
      const id = jobId || paramsJobId;
      if (id) {
        response = await jobService.updateJob(id, submitData);
      } else {
        response = await jobService.createJob(submitData);
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

  // Quill modules configuration for toolbar
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link'],
      ['clean']
    ],
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. New York, NY / Remote"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value as Industry)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {INDUSTRIES.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleInputChange('employment_type', e.target.value as EmploymentType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.employment_type && <p className="text-sm text-red-600 mt-1">{errors.employment_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => handleInputChange('experience_level', e.target.value as ExperienceLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.experience_level && <p className="text-sm text-red-600 mt-1">{errors.experience_level}</p>}
              </div>
            </div>
          </div>
        );

      case 1: // Requirements
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g. React, JavaScript, Python)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              {formData.skills_required.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500 mb-1">No skills added yet</p>
                  <p className="text-sm text-gray-400">Add skills that are required for this position</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills_required.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.skills_required && <p className="text-sm text-red-600 mt-1">{errors.skills_required}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description <span className="text-red-500">*</span>
              </label>
              <ReactQuill
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                modules={quillModules}
                placeholder="Provide a detailed description of the job role, responsibilities, and what makes this opportunity unique..."
                className="border border-gray-300 rounded-md"
                theme="snow"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description.replace(/<[^>]+>/g, '').length}/5000 characters
                </p>
              </div>
            </div>
          </div>
        );

      case 2: // Settings
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as JobStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {JOB_STATUS.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posted Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.posted_at}
                    onChange={(e) => handleInputChange('posted_at', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {errors.posted_at && <p className="text-sm text-red-600 mt-1">{errors.posted_at}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                {errors.expiry_date && <p className="text-sm text-red-600 mt-1">{errors.expiry_date}</p>}
                <p className="text-xs text-gray-500 mt-1">Leave empty if no expiry date</p>
              </div>
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review Job Post</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Title:</span> {formData.title}</p>
                  <p><span className="font-medium">Location:</span> {formData.location}</p>
                  <p><span className="font-medium">Industry:</span> {formData.industry}</p>
                  <p><span className="font-medium">Employment Type:</span> {formData.employment_type.replace('_', ' ')}</p>
                  <p><span className="font-medium">Experience Level:</span> {formData.experience_level}</p>
                  <p><span className="font-medium">Status:</span> {formData.status}</p>
                  <p><span className="font-medium">Posted Date:</span> {formData.posted_at}</p>
                  {formData.expiry_date && <p><span className="font-medium">Expiry Date:</span> {formData.expiry_date}</p>}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <div className="bg-white p-4 rounded border text-sm" dangerouslySetInnerHTML={{ __html: formData.description }} />
              </div>

              <div>
                <h4 className="font-medium mb-2">Required Skills ({formData.skills_required.length})</h4>
                {formData.skills_required.length === 0 ? (
                  <p className="text-sm text-gray-500">No skills specified</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {formData.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 rounded text-xs bg-primary-100 text-primary-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && !formData.title) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-primary-600 px-6 py-4">
        <h1 className="text-xl font-semibold text-white">
          {(jobId || paramsJobId) ? 'Update Job Post' : 'Create New Job Post'}
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
                    ? 'bg-primary-600 border-primary-600 text-white'
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isLoading ? 'Saving...' : ((jobId || paramsJobId) ? 'Update Job Post' : 'Create Job Post')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UpserJobPost: React.FC<{role:string}> = ({role}) => {
  const [showForm, setShowForm] = useState<boolean>(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSuccess = (response: Job | null) => {
    if (response) {
      Swal.fire({
        title: 'Success!',
        text: 'The job has been processed successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        setShowForm(false);
        navigate('/admin/dashboard/recruiting-management/', { replace: true });
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to process the job. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const handleEdit = (jobId: string) => {
    setEditingJobId(jobId);
    setShowForm(true);
  };

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <Check className="mx-auto h-16 w-16 text-primary-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Job Post {editingJobId ? 'Updated' : 'Created'} Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your job posting has been saved and is now ready for candidates to view.
            </p>
            <div className="space-x-4">
              {!editingJobId && (
                <button
                  onClick={() => {
                    setEditingJobId(null);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Create Another Job Post
                </button>
              )}
              <button
                onClick={() => navigate('/admin/dashboard/recruiting-management/', { replace: true })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go Back to Recruitment Management Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 py-8">
      <div className="w-full mx-auto px-4">
        <JobForm
          jobId={editingJobId!}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default UpserJobPost;