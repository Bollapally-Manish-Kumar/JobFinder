/**
 * JobCard Component - Displays job listing with blur for unpaid users
 */

import { MapPin, Building2, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Lock, Clock, ClipboardList, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper function to format freshness
function getFreshness(postedAt) {
  if (!postedAt) return null;
  
  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return { text: 'Posted today', color: 'text-green-400', bg: 'bg-green-500/20' };
  } else if (diffDays === 1) {
    return { text: 'Yesterday', color: 'text-green-400', bg: 'bg-green-500/20' };
  } else if (diffDays <= 3) {
    return { text: `${diffDays} days ago`, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
  } else if (diffDays <= 7) {
    return { text: `${diffDays} days ago`, color: 'text-orange-400', bg: 'bg-orange-500/20' };
  } else if (diffDays <= 14) {
    return { text: '1 week ago', color: 'text-dark-400', bg: 'bg-dark-600' };
  } else if (diffDays <= 30) {
    return { text: `${Math.floor(diffDays / 7)} weeks ago`, color: 'text-dark-400', bg: 'bg-dark-600' };
  } else {
    return { text: 'Over a month ago', color: 'text-dark-500', bg: 'bg-dark-700' };
  }
}

function JobCard({ job, onSave, isSaved, showSaveButton = true, onTrack, isTracking, trackingStatus }) {
  const { isLocked } = job;
  const freshness = getFreshness(job.postedAt);

  return (
    <div className={`card card-hover p-5 ${isLocked ? 'relative overflow-hidden' : ''}`}>
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-dark-300 text-sm">Pay ₹10 to unlock</p>
            <Link
              to="/payment"
              className="inline-block mt-2 text-primary-500 text-sm font-medium hover:text-primary-400"
            >
              Pay to Unlock
            </Link>
          </div>
        </div>
      )}

      {/* Card content */}
      <div className={isLocked ? 'blur-content' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-primary-400 mt-1">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{job.company}</span>
            </div>
          </div>
          
          {/* Source badge */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="badge badge-source">
              {job.source}
            </span>
            {freshness && (
              <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${freshness.bg} ${freshness.color}`}>
                <Clock className="w-3 h-3" />
                {freshness.text}
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          {job.experience && (
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{job.experience}</span>
            </div>
          )}
          {job.salary && (
            <span className="text-green-400">{job.salary}</span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-dark-400 text-sm line-clamp-2 mb-4">
            {job.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={job.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
          
          {/* Track Application Button */}
          {onTrack && (
            <button
              onClick={() => onTrack(job.id)}
              className={`p-2 rounded-lg border transition-all ${
                isTracking 
                  ? 'bg-green-500/10 border-green-500 text-green-400' 
                  : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-green-500 hover:text-green-400'
              }`}
              title={isTracking ? `Tracking: ${trackingStatus}` : 'Track Application'}
            >
              {isTracking ? (
                <Check className="w-5 h-5" />
              ) : (
                <ClipboardList className="w-5 h-5" />
              )}
            </button>
          )}
          
          {showSaveButton && (
            <button
              onClick={() => onSave?.(job.id)}
              className={`p-2 rounded-lg border transition-all ${
                isSaved 
                  ? 'bg-primary-500/10 border-primary-500 text-primary-400' 
                  : 'bg-dark-700 border-dark-600 text-dark-400 hover:border-primary-500 hover:text-primary-400'
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Status badges */}
        {(job.isIndiaEligible || job.isRemote || job.verified) && (
          <div className="mt-3 pt-3 border-t border-dark-700 flex flex-wrap gap-2">
            {job.isIndiaEligible && (
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                🇮🇳 India Eligible
              </span>
            )}
            {job.isRemote && (
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-medium">
                🌐 Remote
              </span>
            )}
            {job.verified && (
              <span className="badge badge-verified">
                ✓ Verified
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobCard;
