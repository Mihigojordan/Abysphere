
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Upload, 
  GraduationCap,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Save,
  Send,
  MapPin
} from 'lucide-react';
import Quill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import applicantService from '../../services/applicantService';
import jobService from '../../services/jobService';
import type { Job } from '../../types/model';
import type { CreateApplicantInput } from '../../services/applicantService';
import Swal from 'sweetalert2';

// Define type for form data to ensure consistency
type FormData = CreateApplicantInput & {
  coverLetter: string;
  cvFile: File | null;
  agreedToTerms: boolean;
  marketingConsent: boolean;
};

// Valid MIME types for CV file upload
const VALID_CV_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

const JobApplicationForm: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [job, setJob] = useState<Job | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initial form data with explicit type
  const initialFormData: FormData = {
    jobId: jobId ? parseInt(jobId) : 0,
    name: '',
    email: '',
    phone: '',
    cvFile: null,
    skills: [],
    experienceYears: 0,
    education: [{ degree: '', school: '', year: '', field: '' }],
    coverLetter: '',
    agreedToTerms: false,
    marketingConsent: false,
  };

  // Application form data
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const steps = [
    { id: 1, title: 'Basic Information', icon: User },
    { id: 2, title: 'Experience & Skills', icon: Briefcase },
    { id: 3, title: 'Education', icon: GraduationCap },
    { id: 4, title: 'Documents & Details', icon: Upload },
    { id: 5, title: 'Review & Submit', icon: CheckCircle },
  ];

  // Fetch job data and load draft from localStorage
  useEffect(() => {
    const fetchJobAndDraft = async () => {
      if (!jobId) return;

      setLoading(true);
      try {
        // Fetch job details
        const jobData = await jobService.getJobById(jobId);
        if (jobData) {
          setJob(jobData);
        } else {
          throw new Error('Job not found');
        }

        // Load draft from localStorage
        const userEmail = 'user@example.com'; // Replace with actual user email from auth context
        const draftKey = `jobApplicationDraft_${jobId}_${userEmail}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
          const draft = JSON.parse(savedDraft) as Partial<FormData & { currentStep: number }>;
          setFormData({
            jobId: draft.jobId ?? initialFormData.jobId,
            name: draft.name ?? '',
            email: draft.email ?? '',
            phone: draft.phone ?? '',
            cvFile: null, // CV file cannot be stored in localStorage
            skills: draft.skills ?? [],
            experienceYears: draft.experienceYears ?? 0,
            education: draft.education ?? [{ degree: '', school: '', year: '', field: '' }],
            coverLetter: draft.coverLetter ?? '',
            agreedToTerms: draft.agreedToTerms ?? false,
            marketingConsent: draft.marketingConsent ?? false,
          });
          setCurrentStep(draft.currentStep ?? 1);
        }
      } catch (error: unknown) {
        console.error('Error fetching job:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load job';
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndDraft();
  }, [jobId]);

  // Validate form data for each step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        break;
      case 2:
        if (formData.experienceYears ==undefined || formData.experienceYears == null) newErrors.experienceYears = 'Experience years is required';
        if (formData.skills.length === 0) newErrors.skills = 'At least one skill is required';
        break;
      case 3:
        if (formData.education.some((edu:any) => !edu.degree || !edu.school)) {
          newErrors.education = 'Please complete all education entries or remove empty ones';
        }
        break;
      case 4:
        if (!formData.cvFile) {
          newErrors.cv = 'Please upload your CV';
        }
        break;
      case 5:
        if (!formData.agreedToTerms) newErrors.terms = 'You must agree to the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = <T extends keyof FormData>(field: T, value: FormData[T]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field as string]: '' }));
    }
  };

  // Handle skills
  const handleSkillAdd = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove),
    }));
  };

  // Handle education
  const handleEducationChange = (index: number, field: keyof FormData['education'][0], value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      education: newEducation,
    }));
  };

  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', year: '', field: '' }],
    }));
  };

  const removeEducationEntry = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_:any, i:number) => i !== index),
      }));
    }
  };

  // Handle file selection (store locally, upload on submit)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (VALID_CV_MIME_TYPES.includes(file.type as typeof VALID_CV_MIME_TYPES[number])) {
        setFormData(prev => ({
          ...prev,
          cvFile: file,
        }));
        setErrors(prev => ({ ...prev, cv: '' }));
      } else {
        setErrors(prev => ({ ...prev, cv: 'Please upload a PDF, DOC, or DOCX file' }));
      }
    }
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    try {
      const userEmail = 'user@example.com'; // Replace with actual user email from auth context
      const draftKey = `jobApplicationDraft_${jobId}_${userEmail}`;
      const draftData = {
        jobId: parseInt(jobId!),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        skills: formData.skills,
        experienceYears: parseInt(formData.experienceYears!.toString()) || 0,
        education: formData.education.filter((edu:any) => edu.degree && edu.school),
        coverLetter: formData.coverLetter,
        agreedToTerms: formData.agreedToTerms,
        marketingConsent: formData.marketingConsent,
        currentStep,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      Swal.fire({
        title: 'Draft Saved!',
        text: 'Your application draft has been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error: unknown) {
      console.error('Error saving draft:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save draft. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Clear draft from localStorage and reset form
  const handleClearDraft = async () => {
    const result = await Swal.fire({
      title: 'Clear Draft?',
      text: 'Are you sure you want to clear your application draft? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const userEmail = 'user@example.com'; // Replace with actual user email from auth context
        const draftKey = `jobApplicationDraft_${jobId}_${userEmail}`;
        localStorage.removeItem(draftKey);
        setFormData(initialFormData);
        setCurrentStep(1);
        setErrors({});
        Swal.fire({
          title: 'Draft Cleared!',
          text: 'Your application draft has been cleared.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (error: unknown) {
        console.error('Error clearing draft:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to clear draft. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setSubmitting(true);
    try {
      // Prepare FormData for submission
      const submissionData = new FormData();
      submissionData.append('jobId', jobId!);
      submissionData.append('name', formData.name);
      submissionData.append('email', formData.email);
      if (formData.phone) submissionData.append('phone', formData.phone);
      submissionData.append('skills', JSON.stringify(formData.skills));
      submissionData.append('experienceYears', formData.experienceYears!.toString());
      submissionData.append('education', JSON.stringify(formData.education.filter((edu:any) => edu.degree && edu.school)));
      submissionData.append('coverLetter', formData.coverLetter);
      if (formData.cvFile) {
        submissionData.append('cvFile', formData.cvFile);
      }

      // Submit application
      await applicantService.createApplicant(submissionData);
      
      // Clear draft from localStorage on successful submission
      const userEmail = 'user@example.com'; // Replace with actual user email
      const draftKey = `jobApplicationDraft_${jobId}_${userEmail}`;
      localStorage.removeItem(draftKey);
      
      Swal.fire({
        title: 'Success!',
        text: 'The operation was completed successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
      navigate('/jobs', { replace: true });
    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Skill input component
  const SkillInput: React.FC = () => {
    const [skillInput, setSkillInput] = useState<string>('');

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        handleSkillAdd(skillInput);
        setSkillInput('');
      }
    };

    return (
      <div>
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a skill and press Enter or comma"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => {
            handleSkillAdd(skillInput);
            setSkillInput('');
          }}
          className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add Skill
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-11/12 mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job
            </button>
            <span className="text-sm text-gray-500">Step {currentStep} of {steps.length}</span>
          </div>
          
          {job && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Aby Hr Management
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-12 h-0.5 ml-6 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errors.general}
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
                <p className="text-gray-600">Let's start with your basic contact information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          )}

          {/* Step 2: Experience & Skills */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Briefcase className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Experience & Skills</h2>
                <p className="text-gray-600">Tell us about your professional background</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <select
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.experienceYears ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select years of experience</option>
                  <option value="0">0 years (Entry level)</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5">5 years</option>
                  <option value="6">6-8 years</option>
                  <option value="9">9-12 years</option>
                  <option value="13">13+ years</option>
                </select>
                {errors.experienceYears && <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills *
                </label>
                <SkillInput />
                {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                
                {formData.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Added Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(skill)}
                            className="hover:text-primary-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <GraduationCap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
                <p className="text-gray-600">Share your educational background</p>
              </div>

              <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {formData.education.map((edu : any, index:number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                      {formData.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducationEntry(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Degree/Certificate *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          School/University *
                        </label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., University of California"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          value={edu.year}
                          onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g., 2023"
                          min="1980"
                          max="2030"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {errors.education && <p className="text-red-500 text-sm">{errors.education}</p>}

              <button
                type="button"
                onClick={addEducationEntry}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                Add Another Education
              </button>
            </div>
          )}

          {/* Step 4: Documents & Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Upload className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents & Details</h2>
                <p className="text-gray-600">Upload your CV and provide additional information</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CV/Resume *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    {formData.cvFile ? (
                      <p className="text-green-600 font-medium">{formData.cvFile.name}</p>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-2">Click to upload your CV/Resume</p>
                        <p className="text-sm text-gray-400">PDF, DOC, or DOCX files only</p>
                      </>
                    )}
                  </label>
                </div>
                {errors.cv && <p className="text-red-500 text-sm mt-1">{errors.cv}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <Quill
                  value={formData.coverLetter}
                  onChange={(value) => handleInputChange('coverLetter', value)}
                  className="bg-white"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      ['list', 'bullet'],
                      ['link'],
                      ['clean'],
                    ],
                  }}
                  formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                  placeholder="Tell us why you're interested in this role..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                <p className="text-gray-600">Please review your application before submitting</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-gray-600">Name: {formData.name}</p>
                  <p className="text-gray-600">Email: {formData.email}</p>
                  {formData.phone && <p className="text-gray-600">Phone: {formData.phone}</p>}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Experience</h3>
                  <p className="text-gray-600">Years: {formData.experienceYears}</p>
                  <p className="text-gray-600">Skills: {formData.skills.join(', ')}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Education</h3>
                  {formData.education.filter((edu:any) => edu.degree && edu.school).map((edu:any, index:number) => (
                    <p key={index} className="text-gray-600">
                      {edu.degree} {edu.field && `in ${edu.field}`} from {edu.school} {edu.year && `(${edu.year})`}
                    </p>
                  ))}
                </div>

                {formData.cvFile && (
                  <div>
                    <h3 className="font-semibold text-gray-900">CV/Resume</h3>
                    <p className="text-gray-600">File: {formData.cvFile.name}</p>
                  </div>
                )}

                {formData.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Cover Letter</h3>
                    <div className="text-gray-600 prose" dangerouslySetInnerHTML={{ __html: formData.coverLetter }} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    id="terms"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a> *
                  </label>
                </div>
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.marketingConsent}
                    onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    id="marketing"
                  />
                  <label htmlFor="marketing" className="text-sm text-gray-700">
                    I would like to receive email updates about similar job opportunities and company news
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleClearDraft}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Draft
              </button>
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-primary-50 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
              <p className="text-primary-800 text-sm mb-3">
                Having trouble with your application? Here are some tips:
              </p>
              <ul className="text-primary-800 text-sm space-y-1">
                <li>• Make sure all required fields are completed</li>
                <li>• Upload your CV in PDF, DOC, or DOCX format</li>
                <li>• Add relevant skills that match the job requirements</li>
                <li>• Double-check your contact information for accuracy</li>
              </ul>
              <div className="mt-4">
                <a 
                  href="mailto:support@abyhr.com" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Contact Support: support@abyhr.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator (Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Step {currentStep} of {steps.length}</span>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-primary-600 font-medium">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
