/**
 * Saved Jobs Page - View and manage saved jobs
 */

import { useState, useEffect } from 'react';
import { Bookmark, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import JobCard from '../components/JobCard';
import jobService from '../services/jobService';
import SEO from '../components/SEO';

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved jobs
  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getSavedJobs();
      setJobs(data.jobs);
    } catch (error) {
      toast.error('Failed to fetch saved jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  // Handle unsave job
  const handleUnsave = async (jobId) => {
    try {
      await jobService.unsaveJob(jobId);
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job removed from saved');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  return (
    <div>
      <SEO 
        title="Saved Jobs - Your Bookmarked Opportunities | JobFinder+"
        description="View and manage your saved job listings. Keep track of opportunities you're interested in and apply when ready."
        keywords="saved jobs, bookmarked jobs, job tracker, my jobs"
        url="https://jobfinderplus.vercel.app/saved-jobs"
      />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-primary-500" />
            Saved Jobs
          </h1>
          <p className="text-dark-400 mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button
          onClick={fetchSavedJobs}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-6 bg-dark-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-dark-700 rounded w-1/2 mb-4" />
              <div className="h-4 bg-dark-700 rounded w-full mb-2" />
              <div className="h-4 bg-dark-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No saved jobs</h3>
          <p className="text-dark-400">
            Jobs you save will appear here. Start browsing and save jobs you're interested in!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="relative">
              <JobCard
                job={job}
                onSave={handleUnsave}
                isSaved={true}
              />
              {job.savedAt && (
                <p className="text-xs text-dark-500 mt-2 px-1">
                  Saved on {new Date(job.savedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
