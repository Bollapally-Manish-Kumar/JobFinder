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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Premium Feature</h2>
          <p className="text-dark-400 mb-6">
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
    <div>
      <SEO 
        title="AI Resume Builder - Generate Professional LaTeX Resumes | JobFinder+"
        description="Create ATS-friendly, professional resumes with AI. Generate LaTeX-formatted resumes tailored to job descriptions. Free AI-powered resume builder for tech jobs."
        keywords="AI resume builder, LaTeX resume generator, ATS resume, professional resume maker, free resume builder, tech resume, AI CV generator"
        url="https://jobfinderplus.vercel.app/resume-builder"
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary-500" />
          Resume LaTeX Generator
        </h1>
        <p className="text-dark-400 mt-1">
          Generate a professional LaTeX resume tailored to any job description
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input section */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Job Description
          </h2>
          
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here...

Example:
We are looking for a Software Engineer with 2+ years of experience in React, Node.js, and cloud technologies. The ideal candidate should have strong problem-solving skills..."
            className="input min-h-[300px] resize-none"
            disabled={loading}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-dark-500">
              {jobDescription.length} characters (min. 50)
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading || jobDescription.length < 50}
              className="btn-primary flex items-center gap-2"
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
          <div className="mt-6 p-4 bg-dark-700/50 rounded-lg">
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
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              LaTeX Output
            </h2>
            {latexCode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
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
                  className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
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
              <pre className="bg-dark-700 rounded-lg p-4 overflow-auto max-h-[500px] text-sm text-dark-300 font-mono">
                {latexCode}
              </pre>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-dark-700 rounded-lg">
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
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
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
