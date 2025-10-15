import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  Building, 
  DollarSign,
  ArrowLeft,
  Share2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import company_logo from '../../../src/assets/images/aby_hr.png';
import jobService from '../../services/jobService';
import type { Job } from '../../types/model';

const JobDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const navigate = useNavigate();

  // Current date and time (September 17, 2025, 02:00 PM CAT)
  const currentDate = new Date('2025-09-17T14:00:00+02:00');

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError('Job ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const jobData = await jobService.getJobById(id);
        
        if (!jobData) {
          setError('Job not found');
        } else {
          setJob(jobData);
        }
      } catch (err: unknown) {
        console.error('Error fetching job:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job details';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = currentDate;
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getDaysLeft = (expiryDate?: string): string => {
    if (!expiryDate) return 'Unknown';
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (isNaN(diffDays)) return 'Unknown';
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    return `${diffDays} day${diffDays === 1 ? '' : 's'} left`;
  };

  const getEmploymentTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'full_time':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'part_time':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'internship':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getExperienceLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'entry':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'mid':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'senior':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApply = async () => {
    navigate(`/jobs/apply-job/${id}`);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job opportunity: ${job?.title} at Aby Hr Management`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Check if job is closed or expired
  const isJobUnavailable = job && (
    job.status === 'CLOSED' || 
    (job.expiry_date && new Date(job.expiry_date) < currentDate)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full xl:w-11/12 mx-auto px-4 py-6">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-2/3 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">{error || 'The job you are looking for does not exist.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isJobUnavailable) {
    return (
      <div className="min-h-[70vh] overflow-y-auto bg-gray-50">
        <div className="border-b border-gray-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary-500 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-semibold text-gray-900">{job.title}</h1>
                </div>
                <p className="text-sm text-gray-600">Aby Hr Management</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-96 p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Job Unavailable</h2>
            <p className="text-sm text-gray-500 mb-4">
              ⚠️ This job is {job.status === 'CLOSED' ? 'closed' : 'expired'} and is no longer accepting applications. Please explore other opportunities.
            </p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full xl:w-11/12 mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-shrink-0">
              <img
                src={company_logo}
                alt="Company Logo"
                className="w-20 h-20 rounded-lg object-cover border border-gray-100"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h1>
                  <p className="text-base font-medium text-gray-700">Aby Hr Management</p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-lg transition-colors ${
                      isSaved 
                        ? 'text-primary-600 bg-primary-50 hover:bg-primary-100' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Job Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span>Posted {getTimeAgo(job.posted_at!)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{getDaysLeft(job.expiry_date)}</span>
                </div>
                {job.industry && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-500" />
                    <span>{job.industry}</span>
                  </div>
                )}
                {job.applicants && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>{job.applicants.length} Applicants</span>
                  </div>
                )}
              </div>

              {/* Job Tags */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getEmploymentTypeColor(job.employment_type)}`}>
                  {job.employment_type.replace('_', ' ')}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getExperienceLevelColor(job.experience_level)}`}>
                  {job.experience_level.replace('_', ' ')}
                </span>
                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {job.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="text-sm text-gray-700">
                {job.description ? (
                  <div>
                    <div className={`${isDescriptionExpanded ? '' : 'max-h-40 overflow-hidden'}`}>
                      {job.description.split('\n').map((paragraph, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border text-sm" dangerouslySetInnerHTML={{ __html: paragraph }} />
                      ))}
                    </div>
                    {job.description.length > 300 && (
                      <button
                        onClick={toggleDescription}
                        className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        {isDescriptionExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            View Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View More
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p>No description available.</p>
                )}
              </div>
            </div>

            {/* Required Skills */}
            {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills_required.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium rounded-lg border border-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">About the Company</h2>
              <div className="flex items-start gap-4 flex-wrap">
                <img
                  src={company_logo}
                  alt="Company Logo"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Aby Hr Management</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    A leading human resources management company dedicated to connecting talented professionals 
                    with exceptional career opportunities across various industries.
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a href="https://www.abyhr.com" target="_blank" rel="noopener noreferrer">www.abyhr.com</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>500+ employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@abyhr.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Sidebar */}
          <div className="space-y-6">
            {/* Application Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Ready to Apply?</h3>
                <p className="text-sm text-gray-600">
                  Join our team and start your next career journey
                </p>
              </div>

              {hasApplied ? (
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Application Submitted!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    We've received your application and will review it shortly.
                  </p>
                  <button className="w-full bg-green-100 text-green-800 text-sm font-medium py-2 px-4 rounded-lg cursor-default">
                    Application Sent
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleApply}
                    disabled={isApplying || getDaysLeft(job.expiry_date) === 'Expired'}
                    className="w-full bg-primary-500 text-white text-sm font-medium py-3 px-4 rounded-lg hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isApplying ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </div>
                    ) : (
                      'Apply Now'
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailView;