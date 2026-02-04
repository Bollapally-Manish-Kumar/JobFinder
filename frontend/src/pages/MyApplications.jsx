/**
 * MyApplications Page - Track job applications
 * Status: Applied → Interview → Offer → Rejected
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Clock, CheckCircle, XCircle, MessageSquare,
  ArrowRight, ExternalLink, Trash2, Filter, BarChart2,
  Send, Users, Award, X, Globe, ClipboardList, Zap, Shield, FileText
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const STATUS_CONFIG = {
  APPLIED: {
    label: 'Applied',
    icon: Send,
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500'
  },
  INTERVIEW: {
    label: 'Interview',
    icon: Users,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500'
  },
  OFFER: {
    label: 'Offer',
    icon: Award,
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500'
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500'
  }
};

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [axonEvents, setAxonEvents] = useState([]);
  const [loadingAxonEvents, setLoadingAxonEvents] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [editingNotes, setEditingNotes] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchAxonApplyEvents();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications');
      setApplications(response.data.applications);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAxonApplyEvents = async () => {
    try {
      const response = await api.get('/axon-apply/events?limit=50');
      setAxonEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching AxonApply events:', error);
    } finally {
      setLoadingAxonEvents(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/applications/${id}`, { status: newStatus });
      toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
      fetchApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteApplication = async (id) => {
    if (!confirm('Remove this application from tracker?')) return;

    try {
      await api.delete(`/applications/${id}`);
      toast.success('Application removed');
      fetchApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to remove application');
    }
  };

  const saveNotes = async (id) => {
    try {
      await api.patch(`/applications/${id}`, { notes: noteText });
      toast.success('Notes saved');
      setEditingNotes(null);
      fetchApplications();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes');
    }
  };

  const filteredApplications = filter === 'ALL'
    ? applications
    : applications.filter(app => app.status === filter);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO
        title="My Applications - Track Job Applications | GoAxonAI"
        description="Track all your job applications in one place. Monitor application status, interviews, offers, and rejections."
        keywords="job application tracker, application status, interview tracker, job search organizer"
        url="https://www.goaxonai.in/my-applications"
        noIndex={true}
      />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8 text-white" />
          My Applications
        </h1>
        <p className="text-dark-400">
          Track your job applications and monitor your progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div
          onClick={() => setFilter('ALL')}
          className={`card p-4 cursor-pointer transition-all ${filter === 'ALL' ? 'ring-2 ring-primary-500' : ''}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-500/20">
              <BarChart2 className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-dark-400">Total</p>
            </div>
          </div>
        </div>

        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <div
            key={status}
            onClick={() => setFilter(status)}
            className={`card p-4 cursor-pointer transition-all ${filter === status ? `ring-2 ${config.border}` : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <config.icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats[status.toLowerCase()]}
                </p>
                <p className="text-xs text-dark-400">{config.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AxonApply History */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">AxonApply™ History</h2>
          </div>
          <div className="text-xs text-dark-500 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            User-controlled submissions only
          </div>
        </div>

        {loadingAxonEvents ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : axonEvents.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="w-10 h-10 text-dark-500 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">No AxonApply™ activity yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-dark-400 border-b border-dark-700">
                  <th className="text-left py-2">Job</th>
                  <th className="text-left py-2">Company</th>
                  <th className="text-left py-2">Platform</th>
                  <th className="text-left py-2">Resume</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {axonEvents.map((event) => (
                  <tr key={event.id} className="border-b border-dark-800/50">
                    <td className="py-2 text-white max-w-[220px] truncate">{event.jobTitle}</td>
                    <td className="py-2 text-dark-300">{event.company}</td>
                    <td className="py-2 text-dark-300">{event.platform}</td>
                    <td className="py-2 text-dark-300">{event.resumeVersion || 'Default'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        event.status === 'APPLIED'
                          ? 'bg-green-500/20 text-green-400'
                          : event.status === 'SKIPPED'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="py-2 text-dark-400">{formatDateTime(event.appliedAt || event.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-16 h-16 text-dark-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {filter === 'ALL' ? 'No applications yet' : `No ${STATUS_CONFIG[filter]?.label || filter} applications`}
          </h3>
          <p className="text-dark-400 mb-6">
            Start tracking your job applications from the Dashboard
          </p>
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            Browse Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const config = STATUS_CONFIG[app.status];
            const StatusIcon = config.icon;

            return (
              <div key={app.id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {app.job.title}
                        </h3>
                        <p className="text-primary-400">{app.job.company}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-dark-400">
                          <span>{app.job.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Applied {formatDate(app.appliedAt)}
                          </span>
                          {app.job.isRemote && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-cyan-400">
                                <Globe className="w-3 h-3" />
                                Remote
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {editingNotes === app.id ? (
                      <div className="mt-3 ml-11">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add notes about this application..."
                          className="input w-full h-20 text-sm"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveNotes(app.id)}
                            className="btn-primary text-xs px-3 py-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotes(null)}
                            className="btn-ghost text-xs px-3 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : app.notes ? (
                      <div
                        onClick={() => { setEditingNotes(app.id); setNoteText(app.notes); }}
                        className="mt-3 ml-11 p-2 bg-dark-700 rounded text-sm text-dark-300 cursor-pointer hover:bg-dark-600 flex items-center gap-2"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {app.notes}
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNotes(app.id); setNoteText(''); }}
                        className="mt-3 ml-11 text-xs text-dark-500 hover:text-dark-300"
                      >
                        + Add notes
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-11 md:ml-0">
                    {/* Status Selector */}
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`input text-sm py-2 px-3 ${config.bg} ${config.color} border ${config.border}`}
                    >
                      {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                        <option key={status} value={status} className="bg-dark-800 text-white">
                          {cfg.label}
                        </option>
                      ))}
                    </select>

                    {/* View Job */}
                    <a
                      href={app.job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => deleteApplication(app.id)}
                      className="p-2 rounded-lg bg-dark-700 text-dark-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyApplications;
