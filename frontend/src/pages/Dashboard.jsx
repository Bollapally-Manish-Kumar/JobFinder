/**
 * Dashboard Page - Main job listings view
 */

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, RefreshCw, ChevronLeft, ChevronRight, X, Clock, TrendingUp, Globe, Wifi, BadgeCheck, Star, Sparkles, Zap, Infinity as InfinityIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import JobDetailModal from '../components/JobDetailModal';
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
  const [selectedJob, setSelectedJob] = useState(null);

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
        toast('Already tracking this job!');
        return;
      }
      await api.post('/applications', { jobId, status: 'APPLIED' });
      setTrackingMap(prev => ({ ...prev, [jobId]: 'APPLIED' }));
      toast.success('Added to Application Tracker!');
    } catch (error) {
      if (error.response?.data?.error === 'Already tracking this job') {
        toast('Already tracking this job!');
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
    <div className="pb-6">
      <SEO
        title="Job Dashboard - Latest Tech Jobs | GoAxon AI"
        description={`Browse ${pagination.total || '1000+'} verified tech jobs from Accenture, TCS, Infosys, and top startups. Updated daily with remote and India-eligible opportunities.`}
        keywords="tech jobs, IT jobs India, software developer jobs, remote jobs, fresher jobs, job dashboard, Accenture careers, TCS jobs, Infosys hiring"
        url="https://www.goaxonai.in/dashboard"
        structuredData={structuredData}
      />

      {/* Hero Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <h1 className="text-xl md:text-3xl font-bold">
            <span className="text-white">Welcome back, </span>
            <span className="animate-gradient-text">{user?.name?.split(' ')[0] || 'User'}!</span>
          </h1>
          {/* Plan Badge */}
          {user?.paymentVerified && user?.plan !== 'BASIC' && (
            <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold flex items-center gap-1.5 ${user?.plan === 'ULTIMATE' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30' :
              user?.plan === 'PRO_PLUS' ? 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 border border-orange-500/30' :
                user?.plan === 'AI' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
              }`}>
              {user?.plan === 'ULTIMATE' ? <><InfinityIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> Ultimate</> :
                user?.plan === 'PRO_PLUS' ? <><Star className="w-3 h-3 md:w-3.5 md:h-3.5" /> Pro Plus</> :
                  user?.plan === 'AI' ? <><Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" /> AI Pro</> : <><Zap className="w-3 h-3 md:w-3.5 md:h-3.5" /> Plus</>}
            </span>
          )}
        </div>
        <p className="text-dark-400 mt-1 md:mt-2 text-xs md:text-base truncate md:whitespace-normal">
          {user?.paymentVerified && user?.plan === 'ULTIMATE'
            ? 'Unlimited AI job matching & professional LaTeX resumes'
            : user?.paymentVerified && user?.plan === 'PRO_PLUS'
              ? 'Full access to premium features and priority support'
              : user?.paymentVerified && user?.plan === 'AI'
                ? 'AI-powered job matching to find your perfect role'
                : user?.paymentVerified && user?.plan === 'BASIC_PLUS'
                  ? 'Access to all job listings and resume tools'
                  : 'Upgrade to unlock all features and job listings'}
        </p>
      </div>

      {/* Stats Grid - Modern Modular Layout - Compact Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {/* Card 1: New Jobs - High Priority */}
        <div className="relative group overflow-hidden bg-dark-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-dark-700/50 hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-dark-400 text-xs md:text-sm font-medium mb-1">Added Today</p>
              <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                {syncStatus.jobsAddedToday}
                {syncStatus.jobsAddedToday > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </h3>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-dark-500 mt-2 md:mt-3 font-medium flex items-center gap-1">
            <span className="text-emerald-400">Live Updates</span>
          </p>
        </div>

        {/* Card 2: Total Jobs - Database Size */}
        <div className="relative group overflow-hidden bg-dark-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-dark-700/50 hover:border-purple-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-dark-400 text-xs md:text-sm font-medium mb-1">Active Jobs</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {syncStatus.totalJobs > 0 ? (syncStatus.totalJobs / 1000).toFixed(1) + 'k+' : '0'}
              </h3>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-dark-500 mt-2 md:mt-3 font-medium flex items-center gap-1">
            <span className="text-purple-400">Verified</span> jobs
          </p>
        </div>

        {/* Card 3: Activity - Personal Stats - Full width on mobile to fill gap */}
        <div className="col-span-2 md:col-span-1 relative group overflow-hidden bg-dark-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-dark-700/50 hover:border-orange-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-orange-500/10 rounded-full blur-2xl -mr-6 -mt-6 transition-opacity group-hover:opacity-100" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-dark-400 text-xs md:text-sm font-medium mb-1">Your Saved</p>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {savedJobIds.size}
              </h3>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
            </div>
          </div>
          <p className="text-[10px] md:text-xs text-dark-500 mt-2 md:mt-3 font-medium flex items-center gap-1">
            <span className="text-orange-400">Track</span> job applications
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="relative card p-3 md:p-5 mb-4 md:mb-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-[1px] bg-dark-800/90 rounded-2xl" />

        <form onSubmit={handleSearch} className="relative flex flex-col gap-2">
          {/* Search row - Compact Grid on mobile */}
          <div className="grid grid-cols-4 md:flex md:flex-row gap-2 md:gap-4">
            {/* Search input - Full width row 1 */}
            <div className="relative col-span-4 md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="input pl-9 py-2 text-sm h-10"
              />
            </div>

            {/* Location - Half width row 2 */}
            <div className="relative col-span-2 md:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City"
                className="input pl-9 py-2 text-sm h-10"
              />
            </div>

            {/* Toggle filters - Quarter width row 2 */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary col-span-1 flex items-center justify-center gap-2 relative text-xs px-2 h-10"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden xs:inline">Filters</span>
              {(selectedSource !== 'All' || selectedType !== 'All' || selectedCategory !== 'All' || indiaEligible || remoteOnly) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-dark-800" />
              )}
            </button>

            {/* Search button - Quarter width row 2 */}
            <button type="submit" className="btn-primary col-span-1 md:w-auto flex items-center justify-center gap-2 text-sm h-10">
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-dark-700/50">
              {/* Type filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm text-dark-400 mb-2 font-medium">Job Type</label>
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
                <label className="block text-sm text-dark-400 mb-2 font-medium">Category</label>
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
                <label className="block text-sm text-dark-400 mb-2 font-medium">Source</label>
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
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 font-medium ${indiaEligible
                    ? 'bg-orange-500/15 border-orange-500/50 text-orange-400'
                    : 'bg-dark-700/50 border-dark-600/50 text-dark-400 hover:border-orange-500/30 hover:text-orange-400'
                    }`}
                >
                  <MapPin className="w-4 h-4" />
                  India
                </button>
              </div>

              {/* Remote toggle */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 font-medium ${remoteOnly
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-400'
                    : 'bg-dark-700/50 border-dark-600/50 text-dark-400 hover:border-cyan-500/30 hover:text-cyan-400'
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  Remote
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
                  className="px-4 py-3 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
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
                  <MapPin className="w-3 h-3" /> India Eligible
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setIndiaEligible(false)} />
                </span>
              )}
              {remoteOnly && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Remote
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
                onViewDetails={() => setSelectedJob(job)}
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

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          jobId={selectedJob.id}
          onClose={() => setSelectedJob(null)}
          onSaveToggle={(jobId, saved) => {
            if (saved) {
              setSavedJobIds(prev => new Set(prev).add(jobId));
            } else {
              setSavedJobIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(jobId);
                return newSet;
              });
            }
          }}
          isSaved={savedJobIds.has(selectedJob.id)}
        />
      )}
    </div>
  );
}

export default Dashboard;
