/**
 * Resume Builder Page - Gemini AI powered LaTeX resume generator
 */

import { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import resumeService from '../services/resumeService';
import useAuthStore from '../hooks/useAuthStore';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { incrementUsageMetric } from '../utils/usageMetrics';

function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState('');
  const [latexCode, setLatexCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { user } = useAuthStore();

  // Generate resume
  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (jobDescription.length < 50) {
      toast.error('Job description must be at least 50 characters');
      return;
    }

    setLoading(true);
    setLatexCode('');

    try {
      const data = await resumeService.generateResume(jobDescription, {
        name: user?.name,
        email: user?.email
      });
      
      setLatexCode(data.latex);
      incrementUsageMetric('resumeBuilds');
      toast.success('Resume generated successfully!');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate resume';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Download as .tex file
  const handleDownload = () => {
    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Resume downloaded!');
  };

  // Show upgrade prompt for non-paid users (only BASIC_PLUS and above can access)
  const hasAccess = user?.role === 'ADMIN' || (user?.paymentVerified && user?.plan !== 'BASIC');
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="relative card p-8 max-w-md text-center overflow-hidden border border-dark-700/70">
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-60 h-28 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center mb-4 shadow-xl shadow-primary-500/25">
            <Lock className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative">Premium Feature</h2>
          <p className="text-dark-300 mb-6 relative leading-relaxed">
            The Resume Builder is available for Basic Plus subscribers and above. 
            Upgrade to generate professional LaTeX resumes tailored to job descriptions.
          </p>
          <Link to="/payment" className="btn-primary inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Upgrade from ₹10/month
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <SEO 
        title="AxonResume™ - AI Resume Builder | Create ATS-Optimized Resumes"
        description="Build professional ATS-friendly resumes with AI. AxonResume™ generates LaTeX resumes tailored to job descriptions. Stand out to recruiters."
        keywords="AI resume builder, ATS resume, LaTeX resume generator, professional resume maker, job resume creator, GoAxonAI AxonResume"
        url="https://www.goaxonai.in/resume-builder"
      />
      <div className="relative mb-6 md:mb-8 p-6 md:p-7 rounded-3xl border border-dark-700/70 bg-gradient-to-b from-dark-800/80 to-dark-900/50 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center justify-center gap-2 md:gap-3 tracking-tight relative">
          <FileText className="w-7 h-7 md:w-8 md:h-8 text-primary-500" />
          AxonResume™
        </h1>
        <p className="text-dark-300 mt-2 text-center relative max-w-2xl mx-auto">
          AI-powered LaTeX resume generator. ATS-friendly & professionally formatted.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input section */}
        <div className="card p-5 md:p-6 border border-dark-700/70">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Job Description
          </h2>

          <div className="mb-4 rounded-xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-xs text-primary-200">
            We use your profile details and the uploaded resume text (if available) to personalize the generated resume.
          </div>
          
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a Software Engineer with 2+ years of experience in React, Node.js, and cloud technologies. The ideal candidate should have strong problem-solving skills..."
            className="input min-h-[320px] resize-none"
            disabled={loading}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-dark-500">
              {jobDescription.length} characters (min. 50)
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading || jobDescription.length < 50}
              className="btn-primary flex items-center gap-2 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Resume Structure
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-dark-800/70 border border-dark-700 rounded-xl">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary-500" />
              Tips for best results
            </h3>
            <ul className="text-sm text-dark-400 space-y-1">
              <li>• Include the full job description</li>
              <li>• Mention required skills and qualifications</li>
              <li>• Add information about the role and responsibilities</li>
              <li>• The more detailed, the better the resume</li>
            </ul>
          </div>
        </div>

        {/* Output section */}
        <div className="card p-5 md:p-6 border border-dark-700/70">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              LaTeX Output
            </h2>
            {latexCode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 rounded-xl"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  Download .tex
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-dark-400">Generating your resume...</p>
                <p className="text-sm text-dark-500 mt-1">This may take a few seconds</p>
              </div>
            </div>
          ) : latexCode ? (
            <div className="relative">
              <div className="absolute inset-x-0 -top-0.5 h-8 bg-gradient-to-b from-dark-800 to-transparent pointer-events-none rounded-t-xl" />
              <pre className="bg-dark-800/90 border border-dark-700 rounded-xl p-4 overflow-auto max-h-[500px] text-sm text-dark-300 font-mono">
                {latexCode}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-dark-700 rounded-xl bg-dark-900/40">
              <div className="text-center">
                <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">Generated LaTeX code will appear here</p>
                <p className="text-sm text-dark-500 mt-1">
                  Enter a job description and click generate
                </p>
              </div>
            </div>
          )}

          {latexCode && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <h3 className="text-sm font-medium text-blue-400 mb-2">
                How to use this LaTeX code
              </h3>
              <ol className="text-sm text-dark-400 space-y-1">
                <li>1. Copy the code or download the .tex file</li>
                <li>2. Open <a href="https://www.overleaf.com" target="_blank" rel="noopener" className="text-blue-400 hover:underline">Overleaf.com</a> (free LaTeX editor)</li>
                <li>3. Create a new project and paste the code</li>
                <li>4. Customize with your details and compile to PDF</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;
