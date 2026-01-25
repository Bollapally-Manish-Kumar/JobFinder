/**
 * JobCard Component - Modern job listing card with glassmorphism
 */

import { MapPin, Building2, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Lock, Clock, ClipboardList, Check, Eye, Sparkles, Flame, Calendar, Coins, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper to strip HTML tags from description
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')  // Remove HTML tags
    .replace(/&nbsp;/g, ' ')    // Replace &nbsp;
    .replace(/&amp;/g, '&')     // Replace &amp;
    .replace(/&lt;/g, '<')      // Replace &lt;
    .replace(/&gt;/g, '>')      // Replace &gt;
    .replace(/&#\d+;/g, '')     // Remove numeric HTML entities
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

// Helper function to check if job is new (scraped within last 2 hours AND posted within 7 days)
function isNewJob(createdAt, postedAt) {
  if (!createdAt) return false;

  const now = new Date();
  const created = new Date(createdAt);
  const createdDiffHours = (now - created) / (1000 * 60 * 60);

  // Must be scraped/added within last 2 hours
  if (createdDiffHours > 2) return false;

  // If postedAt exists, must be posted within last 7 days (not old jobs)
  if (postedAt) {
    const posted = new Date(postedAt);
    const postedDiffDays = (now - posted) / (1000 * 60 * 60 * 24);
    if (postedDiffDays > 7) return false;
  }

  return true;
}

// Helper function to format freshness
function getFreshness(postedAt) {
  if (!postedAt) return null;

  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 24) {
    return { text: 'Today', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <Flame className="w-3 h-3" /> };
  } else if (diffDays === 1) {
    return { text: 'Yesterday', color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <Sparkles className="w-3 h-3" /> };
  } else if (diffDays <= 3) {
    return { text: `${diffDays}d ago`, color: 'text-amber-400', bg: 'bg-amber-500/15', icon: <Clock className="w-3 h-3" /> };
  } else if (diffDays <= 7) {
    return { text: `${diffDays}d ago`, color: 'text-orange-400', bg: 'bg-orange-500/15', icon: <Calendar className="w-3 h-3" /> };
  } else if (diffDays <= 14) {
    return { text: '1w ago', color: 'text-dark-400', bg: 'bg-dark-700/50', icon: null };
  } else if (diffDays <= 30) {
    return { text: `${Math.floor(diffDays / 7)}w ago`, color: 'text-dark-500', bg: 'bg-dark-700/30', icon: null };
  } else {
    return null;
  }
}

function JobCard({ job, onSave, isSaved, showSaveButton = true, onTrack, isTracking, trackingStatus, onViewDetails }) {
  const { isLocked } = job;
  const freshness = getFreshness(job.postedAt);
  const isNew = isNewJob(job.createdAt, job.postedAt);
  const cleanDescription = stripHtml(job.description);

  // Handle card click for expanded view
  const handleCardClick = (e) => {
    // Don't trigger if clicking on buttons/links
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (isLocked) return;
    onViewDetails?.(job.id);
  };

  return (
    <div
      className={`group card p-5 relative overflow-hidden transition-all duration-300 ${isNew && !isLocked ? 'ring-2 ring-primary-500/40 bg-gradient-to-br from-primary-500/5 via-transparent to-purple-500/5' : ''
        } ${!isLocked && onViewDetails ? 'cursor-pointer card-lift hover:border-primary-500/40' : ''}`}
      onClick={handleCardClick}
    >
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-md z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center">
              <Lock className="w-7 h-7 text-primary-400" />
            </div>
            <p className="text-white font-medium mb-1">Premium Content</p>
            <p className="text-dark-400 text-sm mb-3">Unlock with ₹10/month</p>
            <Link
              to="/payment"
              className="btn-primary text-sm py-2 px-4"
            >
              Unlock Now
            </Link>
          </div>
        </div>
      )}

      {/* Card content */}
      <div className={isLocked ? 'blur-content' : ''}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate group-hover:text-primary-400 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500/20 to-orange-500/20 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-primary-400" />
              </div>
              <span className="text-sm text-primary-400 font-medium truncate">{job.company}</span>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {isNew && !isLocked && (
                <span className="px-2 py-1 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-lg shadow-primary-500/25">
                  New
                </span>
              )}
              <span className="badge badge-source text-[10px]">
                {job.source}
              </span>
            </div>
            {freshness && (
              <span className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 ${freshness.bg} ${freshness.color}`}>
                {freshness.icon && <span>{freshness.icon}</span>}
                {freshness.text}
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-dark-400 mb-4">
          <div className="flex items-center gap-1.5 bg-dark-700/50 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-dark-500" />
            <span className="truncate max-w-[140px]">{job.location}</span>
          </div>
          {job.experience && (
            <div className="flex items-center gap-1.5 bg-dark-700/50 px-2.5 py-1 rounded-lg">
              <Briefcase className="w-3.5 h-3.5 text-dark-500" />
              <span>{job.experience}</span>
            </div>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg text-sm">
              <Coins className="w-3.5 h-3.5" />
              {job.salary}
            </span>
          )}
        </div>

        {/* Description */}
        {cleanDescription && (
          <p className="text-dark-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {cleanDescription}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(job.id);
              }}
              className="flex items-center justify-center gap-1.5 text-sm py-2.5 px-4 rounded-xl bg-dark-700/60 text-dark-300 hover:bg-dark-700 hover:text-white border border-dark-600/50 hover:border-primary-500/30 transition-all"
              title="View details & match analysis"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </button>
          )}

          <a
            href={job.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
          >
            <span>Apply</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Track Application Button */}
          {onTrack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrack(job.id);
              }}
              className={`p-2.5 rounded-xl border transition-all ${isTracking
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400'
                : 'bg-dark-700/60 border-dark-600/50 text-dark-400 hover:border-emerald-500/50 hover:text-emerald-400'
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
              onClick={(e) => {
                e.stopPropagation();
                onSave?.(job.id);
              }}
              className={`p-2.5 rounded-xl border transition-all ${isSaved
                ? 'bg-primary-500/15 border-primary-500/50 text-primary-400'
                : 'bg-dark-700/60 border-dark-600/50 text-dark-400 hover:border-primary-500/50 hover:text-primary-400'
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
          <div className="mt-4 pt-4 border-t border-dark-700/50 flex flex-wrap gap-2">
            {job.isIndiaEligible && (
              <span className="px-2.5 py-1 bg-orange-500/15 text-orange-400 rounded-lg text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> India
              </span>
            )}
            {job.isRemote && (
              <span className="px-2.5 py-1 bg-cyan-500/15 text-cyan-400 rounded-lg text-xs font-medium flex items-center gap-1">
                <Globe className="w-3 h-3" /> Remote
              </span>
            )}
            {job.verified && (
              <span className="badge badge-verified text-xs">
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
