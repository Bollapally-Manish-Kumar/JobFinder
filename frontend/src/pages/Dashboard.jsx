/**
 * Dashboard Page - Main job listings view
 */

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, RefreshCw, ChevronLeft, ChevronRight, X, Clock, TrendingUp, Globe, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import jobService from '../services/jobService';
import api from '../services/api';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [indiaEligible, setIndiaEligible] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [filters, setFilters] = useState({
    sources: ['All'],
    types: ['All'],
    categories: ['All'],
    companies: [],
    locations: []
  });
  const [syncStatus, setSyncStatus] = useState({
    jobsAddedToday: 0,
    totalJobs: 0,
    lastSyncAt: null,
    sourceBreakdown: []
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [trackingMap, setTrackingMap] = useState({});
  
  const { user } = useAuthStore();

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const data = await jobService.getSyncStatus();
      setSyncStatus(data);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  // Fetch filter options
  const fetchFilters = async () => {
    try {
      const data = await jobService.getFilters();
      setFilters({
        sources: ['All', ...data.sources],
        types: ['All', ...data.types],
        categories: ['All', ...data.categories],
        companies: data.companies,
        locations: data.locations
      });
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  // Fetch jobs
  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const queryFilters = {};
      if (selectedSource !== 'All') queryFilters.source = selectedSource;
      if (selectedType !== 'All') queryFilters.type = selectedType;
      if (selectedCategory !== 'All') queryFilters.category = selectedCategory;
      if (location) queryFilters.location = location;
      if (searchQuery) queryFilters.search = searchQuery;
      if (indiaEligible) queryFilters.isIndiaEligible = 'true';
      if (remoteOnly) queryFilters.isRemote = 'true';
      
      const data = await jobService.getJobs(page, 20, queryFilters);
      
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch jobs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    try {
      const data = await jobService.getSavedJobs();
      const ids = new Set(data.jobs.map(job => job.id));
      setSavedJobIds(ids);
    } catch (error) {
      console.error('Failed to fetch saved jobs:', error);
    }
  };

  // Fetch tracking status for current jobs
  const fetchTrackingStatus = async (jobIds) => {
    if (!user || jobIds.length === 0) return;
    try {
      const response = await api.post('/applications/bulk-check', { jobIds });
      setTrackingMap(response.data.trackingMap || {});
    } catch (error) {
      console.error('Failed to fetch tracking status:', error);
    }
  };

  // Track application
  const handleTrackJob = async (jobId) => {
    if (!user) {
      toast.error('Please login to track applications');
      return;
    }
    try {
      if (trackingMap[jobId]) {
        toast('Already tracking this job!', { icon: '📋' });
        return;
      }
      await api.post('/applications', { jobId, status: 'APPLIED' });
      setTrackingMap(prev => ({ ...prev, [jobId]: 'APPLIED' }));
      toast.success('Added to Application Tracker!');
    } catch (error) {
      if (error.response?.data?.error === 'Already tracking this job') {
        toast('Already tracking this job!', { icon: '📋' });
      } else {
        toast.error(error.response?.data?.error || 'Failed to track application');
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchFilters();
    fetchSyncStatus();
  }, []);

  // Fetch tracking status when jobs change
  useEffect(() => {
    if (jobs.length > 0 && user) {
      const jobIds = jobs.map(j => j.id);
      fetchTrackingStatus(jobIds);
    }
  }, [jobs, user]);

  useEffect(() => {
    fetchJobs(1);
  }, [selectedSource, selectedType, selectedCategory, location, indiaEligible, remoteOnly]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  // Handle save/unsave job
  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await jobService.unsaveJob(jobId);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast.success('Job removed from saved');
      } else {
        await jobService.saveJob(jobId);
        setSavedJobIds(prev => new Set(prev).add(jobId));
        toast.success('Job saved!');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save job');
    }
  };

  // Structured data for job listings
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": jobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description?.substring(0, 200) || "View full job details",
        "datePosted": job.postedAt || job.createdAt,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location
          }
        },
        "employmentType": job.type || "FULL_TIME",
        "url": job.url
      }
    }))
  };

  return (
    <div className="pb-4">
      <SEO 
        title="Job Dashboard - Latest Tech Jobs | JobFinder+"
        description={`Browse ${pagination.total || '1000+'} verified tech jobs from Accenture, TCS, Infosys, and top startups. Updated daily with remote and India-eligible opportunities.`}
        keywords="tech jobs, IT jobs India, software developer jobs, remote jobs, fresher jobs, job dashboard, Accenture careers, TCS jobs, Infosys hiring"
        url="https://jobfinderplus.vercel.app/dashboard"
        structuredData={structuredData}
      />
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Welcome, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          {/* Badge based on plan */}
          {user?.paymentVerified && user?.plan === 'PRO_PLUS' && (
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-[9px]">★</span>
              </div>
            </div>
          )}
          {user?.paymentVerified && user?.plan === 'AI' && (
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">AI</span>
              </div>
            </div>
          )}
          {user?.paymentVerified && user?.plan === 'BASIC_PLUS' && (
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          )}
        </div>
        <p className="text-dark-400 mt-1">
          {user?.paymentVerified && user?.plan === 'PRO_PLUS' 
            ? 'Pro Plus Member - Full access to all features' 
            : user?.paymentVerified && user?.plan === 'AI' 
              ? 'AI Pro Member - Full access to all jobs & AI matching' 
              : user?.paymentVerified && user?.plan === 'BASIC_PLUS'
                ? 'Plus Member - Access all jobs with your premium subscription'
                : 'Upgrade to see all job listings'}
        </p>
      </div>

      {/* Sync Status Banner */}
      <div className="card p-3 md:p-4 mb-4 md:mb-6 bg-gradient-to-r from-dark-800 to-dark-700 border-dark-600">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-primary-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary-400" />
            </div>
            <div>
              {syncStatus.jobsAddedToday > 0 ? (
                <>
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    {syncStatus.jobsAddedToday} New Jobs Today! 🎉
                  </h3>
                  <p className="text-dark-400 text-xs md:text-sm hidden sm:block">
                    Fresh opportunities available
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    No new jobs posted today
                  </h3>
                  <p className="text-dark-400 text-xs md:text-sm">
                    Check back later for fresh opportunities
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-dark-400">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{syncStatus.totalJobs} total</span>
            </div>
            {syncStatus.lastSyncAt && (
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Updated {new Date(syncStatus.lastSyncAt).toLocaleDateString()}</span>
                <span className="sm:hidden">{new Date(syncStatus.lastSyncAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-3 md:p-4 mb-4 md:mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* Search row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, companies..."
                className="input pl-10"
              />
            </div>

            {/* Location */}
            <div className="relative w-full md:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="input pl-10"
              />
            </div>

            {/* Toggle filters */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedSource !== 'All' || selectedType !== 'All' || selectedCategory !== 'All') && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>

            {/* Search button */}
            <button type="submit" className="btn-primary whitespace-nowrap">
              <Search className="w-4 h-4 md:hidden" />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-dark-700">
              {/* Type filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm text-dark-400 mb-1">Job Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="input w-full"
                >
                  {filters.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Category filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm text-dark-400 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input w-full"
                >
                  {filters.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Source filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm text-dark-400 mb-1">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="input w-full"
                >
                  {filters.sources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* India Eligible toggle */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setIndiaEligible(!indiaEligible)}
                  className={`btn-secondary flex items-center gap-2 ${indiaEligible ? 'bg-orange-500/20 border-orange-500 text-orange-400' : ''}`}
                >
                  <Globe className="w-4 h-4" />
                  India Eligible
                </button>
              </div>

              {/* Remote toggle */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`btn-secondary flex items-center gap-2 ${remoteOnly ? 'bg-blue-500/20 border-blue-500 text-blue-400' : ''}`}
                >
                  <Wifi className="w-4 h-4" />
                  Remote Only
                </button>
              </div>

              {/* Clear filters */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSource('All');
                    setSelectedType('All');
                    setSelectedCategory('All');
                    setLocation('');
                    setIndiaEligible(false);
                    setRemoteOnly(false);
                  }}
                  className="btn-ghost flex items-center gap-2 text-dark-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Active filters tags */}
          {(selectedSource !== 'All' || selectedType !== 'All' || selectedCategory !== 'All' || indiaEligible || remoteOnly) && (
            <div className="flex flex-wrap gap-2">
              {selectedType !== 'All' && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm flex items-center gap-1">
                  {selectedType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('All')} />
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
                  {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                </span>
              )}
              {selectedSource !== 'All' && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm flex items-center gap-1">
                  {selectedSource}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSource('All')} />
                </span>
              )}
              {indiaEligible && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-1">
                  🇮🇳 India Eligible
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setIndiaEligible(false)} />
                </span>
              )}
              {remoteOnly && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-1">
                  🌐 Remote
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setRemoteOnly(false)} />
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-dark-400">
          {loading ? 'Loading...' : `${pagination.total} jobs found`}
        </p>
        <button
          onClick={() => fetchJobs(pagination.page)}
          className="flex items-center gap-2 text-dark-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Job listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 md:p-5 animate-pulse">
              <div className="h-5 md:h-6 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-dark-700 rounded w-1/2 mb-4" />
              <div className="h-4 bg-dark-700 rounded w-full mb-2" />
              <div className="h-4 bg-dark-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-8 md:p-12 text-center">
          <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No jobs found</h3>
          <p className="text-dark-400 text-sm md:text-base">Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSave={handleSaveJob}
                isSaved={savedJobIds.has(job.id)}
                onTrack={user ? handleTrackJob : null}
                isTracking={!!trackingMap[job.id]}
                trackingStatus={trackingMap[job.id]}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 md:gap-4 mt-6 md:mt-8">
              <button
                onClick={() => fetchJobs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn-secondary flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <span className="text-dark-400 text-sm">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => fetchJobs(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn-secondary flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
