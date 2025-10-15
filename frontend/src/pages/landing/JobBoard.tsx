
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Briefcase, Calendar, ChevronRight, ChevronLeft, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import company_logo from '../../../src/assets/images/aby_hr.png';
import jobService from '../../services/jobService';
import { useSocketEvent } from '../../context/SocketContext';
import type { Job } from '../../types/model';
import { useNavigate } from 'react-router-dom';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jobsPerPage] = useState<number>(9); // 3x3 grid

  const navigate = useNavigate();

  // Current date for expiry check (September 13, 2025)
  const currentDate = new Date('2025-09-13');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const jobsData = await jobService.getAllJobs();
        // Filter jobs that are OPEN and not expired
        const validJobs = jobsData.filter(
          (job) =>
            job.status === 'OPEN' &&
            (!job.expiry_date || new Date(job.expiry_date) >= currentDate)
        );
        setJobs(validJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setOperationStatus({ type: 'error', message: 'Failed to load jobs' });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // WebSocket event handlers
  useSocketEvent('jobCreated', (newJob: Job) => {
    // Only add job if it is OPEN and not expired
    if (
      newJob.status === 'OPEN' &&
      (!newJob.expiry_date || new Date(newJob.expiry_date) >= currentDate)
    ) {
      setJobs((prev) => [...prev, newJob]);
      showOperationStatus('success', `New job "${newJob.title}" added!`);
    }
  });

  useSocketEvent('jobUpdated', (updatedJob: Job) => {
    setJobs((prev) =>
      // Only include updated job if it is OPEN and not expired
      prev
        .map((job) => (job.id === updatedJob.id ? updatedJob : job))
        .filter(
          (job) =>
            job.status === 'OPEN' &&
            (!job.expiry_date || new Date(job.expiry_date) >= currentDate)
        )
    );
    if (
      updatedJob.status === 'OPEN' &&
      (!updatedJob.expiry_date || new Date(updatedJob.expiry_date) >= currentDate)
    ) {
      showOperationStatus('info', `Job "${updatedJob.title}" updated!`);
    }
  });

  useSocketEvent('jobDeleted', ({ id }: { id: string }) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
    showOperationStatus('info', `Job deleted.`);
  });

  // Reset to page 1 when filter changes or jobs are updated
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, jobs]);

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date('2025-09-13'); // Use fixed current date
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getEmploymentTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'full_time':
        return 'bg-green-100 text-green-800';
      case 'part_time':
        return 'bg-primary-100 text-primary-800';
      case 'contract':
        return 'bg-red-100 text-red-800';
      case 'internship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceLevelColor = (level: string): string => {
    switch (level.toLowerCase()) {
      case 'entry':
        return 'bg-emerald-100 text-emerald-800';
      case 'mid':
        return 'bg-amber-100 text-amber-800';
      case 'senior':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs: Job[] = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.employment_type.toLowerCase() === filter.toLowerCase();
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Adjust currentPage if it exceeds totalPages after a job deletion
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (filteredJobs.length === 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages, filteredJobs]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of job listings
    document.querySelector('.job-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-12/12 mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-primary-50 p-6">
      <div className="w-12/12 mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-lg text-gray-600  mx-auto">
            Discover amazing opportunities with top companies. Your next career move starts here.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {(['all', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                filter === filterType
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {filterType === 'all' ? 'All Jobs' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-primary-600">{startIndex + 1}-{Math.min(endIndex, filteredJobs.length)}</span> of <span className="font-semibold text-primary-600">{filteredJobs.length}</span> job opportunities
          </p>
        </div>

        {/* Job Cards Grid */}
        <div className="job-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentJobs.map((job) => {
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer"
              >
                <div className="p-6">
                  {/* Company Info Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <img
                        src={company_logo}
                        alt="company logo"
                        className="w-14 h-14 rounded-xl object-cover shadow-sm border border-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">Aby Hr management</p>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span>Posted {formatDate(job.posted_at!)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employment_type)}`}>
                      {job.employment_type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experience_level)}`}>
                      {job.experience_level}
                    </span>
                    {job.industry && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {job.industry}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {job.skills_required && job.skills_required.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-gray-500 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            +{job.skills_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Apply Button */}
                    <button
                      disabled={!job.id}
                      className="w-full bg-gradient-to-r from-primary-600 to-red-600 text-white font-medium py-3 px-4 rounded-xl hover:from-primary-700 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group-hover:shadow-lg"
                      onClick={() => navigate(`/jobs/apply-job/${job.id}`)}
                    >
                      <span>Apply Now</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      disabled={!job.id}
                      onClick={() => navigate(`${job.id}`)}
                      className="w-full border border-primary-300 hover:bg-primary-50 text-primary-600 font-medium py-3 px-4 rounded-xl hover:from-primary-700 hover:to-red-700 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      <span>Read More</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more opportunities.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredJobs.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-400">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Operation Status Toast */}
        {operationStatus && (
          <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
                operationStatus.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : operationStatus.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-primary-50 border-primary-200 text-primary-800'
              }`}
            >
              {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {operationStatus.type === 'info' && <AlertCircle className="w-5 h-5 text-primary-600" />}
              <span className="font-medium">{operationStatus.message}</span>
              <button onClick={() => setOperationStatus(null)} className="ml-2 hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;