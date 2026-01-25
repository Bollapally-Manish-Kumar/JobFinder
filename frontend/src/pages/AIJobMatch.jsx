import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Upload, FileText, Target, TrendingUp,
  CheckCircle, XCircle, AlertCircle, ExternalLink,
  Loader2, IndianRupee, Lock, RefreshCw, File, Globe, MapPin
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../hooks/useAuthStore';
import SEO from '../components/SEO';

function AIJobMatch() {
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [results, setResults] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text' or 'pdf'
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const response = await api.get('/ai-match/check-access');
      setHasAccess(response.data.hasAccess);
    } catch (error) {
      console.error('Failed to check access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target?.result || '');
      toast.success('Resume loaded!');
    };
    reader.readAsText(file);
  };

  const handlePdfFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('PDF size must be under 2MB');
      return;
    }

    setPdfFile(file);
    toast.success(`Selected: ${file.name}`);
  };

  const analyzeTextResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter or upload your resume');
      return;
    }

    if (resumeText.trim().length < 50) {
      toast.error('Resume text is too short. Please provide more details.');
      return;
    }

    setAnalyzing(true);
    setResults(null);

    try {
      const response = await api.post('/ai-match/analyze', { resumeText });

      if (response.data.success) {
        setResults(response.data.matches);
        setResumeProfile(response.data.resumeProfile);
        toast.success(`Found ${response.data.matches.length} matching jobs!`);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      handleAnalysisError(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzePdfResume = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setAnalyzing(true);
    setResults(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('resume', pdfFile);

      setUploadProgress(30);

      const response = await api.post('/ai-match/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(30 + (percentCompleted * 0.3)); // 30-60%
        }
      });

      setUploadProgress(80);

      if (response.data.success) {
        setResults(response.data.matches);
        setResumeProfile(response.data.resumeProfile);
        toast.success(`Found ${response.data.matches.length} matching jobs!`);
        setUploadProgress(100);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      handleAnalysisError(error);
    } finally {
      setAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleAnalysisError = (error) => {
    console.error('Analysis error:', error);
    const errorData = error.response?.data;
    const status = error.response?.status;

    if (status === 429) {
      toast.error('AI service limit reached. Please try again in a few minutes.', { duration: 5000 });
    } else if (status === 503) {
      toast.error('AI service is not configured. Please contact support.');
    } else if (status === 400) {
      toast.error(errorData?.message || 'Invalid file. Please upload a valid PDF.');
    } else {
      toast.error(errorData?.message || errorData?.error || 'Failed to analyze resume');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast.error('Please upload a .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target?.result || '');
      toast.success('Resume loaded!');
    };
    reader.readAsText(file);
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter or upload your resume');
      return;
    }

    if (resumeText.trim().length < 50) {
      toast.error('Resume text is too short. Please provide more details.');
      return;
    }

    setAnalyzing(true);
    setResults(null);

    try {
      const response = await api.post('/ai-match/analyze', { resumeText });

      if (response.data.success) {
        setResults(response.data.matches);
        setResumeProfile(response.data.resumeProfile);
        toast.success(`Found ${response.data.matches.length} matching jobs!`);
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);

      // Handle specific error types
      const errorData = error.response?.data;
      const status = error.response?.status;

      if (status === 429) {
        toast.error('AI service limit reached. Please try again in a few minutes.', { duration: 5000 });
      } else if (status === 503) {
        toast.error('AI service is not configured. Please contact support.');
      } else {
        toast.error(errorData?.message || errorData?.error || 'Failed to analyze resume');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-orange-500/20 border-orange-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Show payment required if no access
  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            AI Job Match
          </h1>

          <p className="text-dark-400 mb-8 max-w-md mx-auto">
            Upload your resume and let AI find the perfect job matches for you.
            Get match percentages, reasons why jobs fit, and skills to improve.
          </p>

          <div className="bg-dark-700 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">What you get:</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-300">Top 5 matching jobs from our database</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-300">Match percentage for each job</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-300">Reasons why each job matches your profile</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-300">Missing skills you should learn</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-300">Unlimited uses after payment</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-dark-400 mb-2">Available in</p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold text-purple-400">
                    <IndianRupee className="w-5 h-5" />
                    <span>20</span>
                  </div>
                  <p className="text-xs text-dark-500">AI Match</p>
                </div>
                <span className="text-dark-600">or</span>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold text-yellow-400">
                    <IndianRupee className="w-5 h-5" />
                    <span>30</span>
                  </div>
                  <p className="text-xs text-dark-500">Pro Plus</p>
                </div>
              </div>
            </div>

            <Link
              to="/payment"
              className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Unlock AI Job Match
            </Link>

            <p className="text-sm text-dark-500">
              Secure payment via UPI
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO
        title="AI Job Matching - Find Perfect Jobs for Your Resume | JobFinder+"
        description="Upload your resume and let AI find the best matching tech jobs. Premium AI-powered job matching using advanced algorithms. Get personalized job recommendations instantly."
        keywords="AI job matching, resume analyzer, job recommendations, AI career matching, smart job search, personalized job search, ML job matching"
        url="https://jobfinderplus.vercel.app/ai-job-match"
      />
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-400 mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Premium Feature</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          AI Job Match
        </h1>
        <p className="text-dark-400">
          Paste or upload your resume to find the best matching jobs
        </p>
      </div>

      {/* Resume Input */}
      <div className="card p-6 mb-6">
        {/* Upload Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUploadMethod('text')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${uploadMethod === 'text'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            Paste Text
          </button>
          <button
            onClick={() => setUploadMethod('pdf')}
            className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${uploadMethod === 'pdf'
              ? 'bg-primary-500 text-white'
              : 'bg-dark-700 text-dark-400 hover:text-white'
              }`}
          >
            <File className="w-4 h-4" />
            Upload PDF
          </button>
        </div>

        {/* Text Input Method */}
        {uploadMethod === 'text' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-400" />
                Your Resume
              </h2>
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload .txt
                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleTextFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here... Include your skills, experience, education, and projects."
              className="input w-full h-64 text-sm resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-dark-500">
                {resumeText.length} characters
              </span>
              <button
                onClick={analyzeTextResume}
                disabled={analyzing || resumeText.length < 50}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Find Matching Jobs
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* PDF Upload Method */}
        {uploadMethod === 'pdf' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <File className="w-5 h-5 text-primary-400" />
                Upload PDF Resume
              </h2>
            </div>

            {/* Drag & Drop Zone */}
            <label className="block w-full p-8 border-2 border-dashed border-dark-600 rounded-xl hover:border-primary-500 transition-colors cursor-pointer text-center mb-4">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileSelect}
                className="hidden"
              />
              <File className="w-12 h-12 text-dark-500 mx-auto mb-4" />
              <p className="text-white font-medium mb-1">
                {pdfFile ? pdfFile.name : 'Click to upload PDF'}
              </p>
              <p className="text-sm text-dark-500">
                Max size: 2MB • PDF only
              </p>
            </label>

            {/* Selected File Info */}
            {pdfFile && (
              <div className="bg-dark-700 rounded-lg p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-primary-400" />
                  <div>
                    <p className="text-white font-medium">{pdfFile.name}</p>
                    <p className="text-sm text-dark-500">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  className="text-dark-400 hover:text-red-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">Processing...</span>
                  <span className="text-primary-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-dark-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={analyzePdfResume}
              disabled={analyzing || !pdfFile}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing PDF...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Analyze & Find Matching Jobs
                </>
              )}
            </button>

            <p className="text-xs text-dark-500 text-center mt-3 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" /> Your PDF is processed securely and deleted immediately after analysis
            </p>
          </>
        )}
      </div>

      {/* Resume Profile Summary */}
      {resumeProfile && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Your Profile Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-dark-400 mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {resumeProfile.technicalSkills?.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-2">Experience Level</p>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm capitalize">
                {resumeProfile.experienceLevel}
              </span>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-2">Domains</p>
              <div className="flex flex-wrap gap-2">
                {resumeProfile.domains?.map((domain, i) => (
                  <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-2">Keywords</p>
              <div className="flex flex-wrap gap-2">
                {resumeProfile.keywords?.slice(0, 5).map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-dark-600 text-dark-300 rounded text-xs">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-primary-400" />
            Top {results.length} Matching Jobs
          </h2>

          {results.length === 0 ? (
            <div className="card p-8 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-dark-400">No strong matches found. Try updating your resume with more details.</p>
            </div>
          ) : (
            results.map((match, index) => (
              <div key={match.job.id} className="card p-6">
                <div className="flex items-start gap-4">
                  {/* Match Score */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center ${getScoreBg(match.matchScore)}`}>
                    <span className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                      {match.matchScore}%
                    </span>
                  </div>

                  {/* Job Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {match.job.title}
                        </h3>
                        <p className="text-primary-400">{match.job.company}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-dark-400">
                          <span>{match.job.location}</span>
                          {match.job.isRemote && (
                            <span className="flex items-center gap-1 text-cyan-400">
                              <Globe className="w-3 h-3" />
                              Remote
                            </span>
                          )}
                          {match.job.isIndiaEligible && (
                            <span className="flex items-center gap-1 text-orange-400">
                              <MapPin className="w-3 h-3" />
                              India
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={match.job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm flex items-center gap-2"
                      >
                        Apply
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Why it matches */}
                    <div className="mt-4">
                      <p className="text-sm text-dark-400 mb-2">Why it matches:</p>
                      <ul className="space-y-1">
                        {match.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-dark-300">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Missing Skills */}
                    {match.missingSkills?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-dark-400 mb-2">Skills to improve:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.missingSkills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Analyze Again */}
          <div className="text-center pt-4">
            <button
              onClick={() => {
                setResults(null);
                setResumeProfile(null);
              }}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Analyze Different Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIJobMatch;
