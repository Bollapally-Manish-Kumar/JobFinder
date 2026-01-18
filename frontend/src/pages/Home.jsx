/**
 * Home Page - Landing page with hero, features, and pricing
 * Modern, unique design that stands out from traditional job boards
 */

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Zap,
  CheckCircle, 
  Rocket, 
  Target,
  Brain,
  FileText,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Sparkles,
  FileCode
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';

// Animated counter hook
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

// Job sources we aggregate from
const jobSources = [
  { name: 'Accenture Careers', logo: 'A', color: 'from-purple-500 to-violet-600' },
  { name: 'TCS NextStep', logo: 'T', color: 'from-blue-500 to-cyan-500' },
  { name: 'Infosys Careers', logo: 'I', color: 'from-orange-500 to-red-500' },
  { name: 'Wipro Careers', logo: 'W', color: 'from-green-500 to-emerald-500' },
  { name: 'LinkedIn Jobs', logo: 'in', color: 'from-blue-600 to-blue-700' },
  { name: 'Naukri.com', logo: 'N', color: 'from-blue-400 to-cyan-400' },
  { name: 'Indeed', logo: 'I', color: 'from-indigo-500 to-purple-500' },
  { name: 'AngelList', logo: 'A', color: 'from-black to-gray-800' },
];

function Home() {
  const jobCount = useCounter(1247);
  const companyCount = useCounter(50);
  const userCount = useCounter(500);

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JobFinder+",
    "url": "https://jobfinderplus.vercel.app",
    "description": "AI-powered job aggregator. Find tech jobs from top MNCs. Resume analysis & smart job matching.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://jobfinderplus.vercel.app/dashboard?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <SEO 
        title="JobFinder+ | AI-Powered Job Aggregator for Tech Careers"
        description="Not just another job board. AI aggregates jobs from 50+ MNCs, analyzes your resume, and shows match scores. Find your perfect tech job faster."
        keywords="AI job matching, job aggregator, tech jobs India, resume analyzer, Accenture jobs, TCS careers, Infosys hiring, AI resume, job match score"
        url="https://jobfinderplus.vercel.app"
        structuredData={structuredData}
      />
      <Navbar />

      {/* HERO - Unique Split Design */}
      <section className="relative min-h-[90vh] lg:min-h-screen pt-20 flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-900 to-purple-900/20" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/5 to-purple-500/5 rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">For Students & Freshers</span>
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
                Every Job.
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    One Place.
                  </span>
                  <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 150 4 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#f97316"/>
                        <stop offset="0.5" stopColor="#a855f7"/>
                        <stop offset="1" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-dark-300 max-w-lg mx-auto lg:mx-0 mb-8">
                We collect jobs from <span className="text-white font-semibold">Accenture, TCS, Infosys & 50+ sources</span> — so you <span className="text-green-400 font-semibold">never miss a single opportunity</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10">
                <Link 
                  to="/register" 
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] text-sm sm:text-base"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Explore Jobs Free
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link 
                  to="/login" 
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-white border border-dark-700 hover:border-dark-600 hover:bg-dark-800/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4" />
                  Login
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center lg:justify-start">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{jobCount}+</div>
                  <div className="text-xs sm:text-sm text-dark-400">Active Jobs</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-dark-700" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{companyCount}+</div>
                  <div className="text-xs sm:text-sm text-dark-400">Companies</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-dark-700" />
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{userCount}+</div>
                  <div className="text-xs sm:text-sm text-dark-400">Users</div>
                </div>
              </div>
            </div>

            {/* Right - Visual: Job Aggregation Visualization */}
            <div className="relative hidden lg:block">
              {/* Main Card */}
              <div className="relative">
                {/* Floating Source Cards */}
                {jobSources.slice(0, 4).map((source, i) => (
                  <div
                    key={i}
                    className={`absolute bg-dark-800/90 backdrop-blur-sm rounded-xl p-3 border border-dark-700/50 shadow-xl animate-float`}
                    style={{
                      top: `${10 + i * 55}px`,
                      left: i % 2 === 0 ? '-30px' : 'auto',
                      right: i % 2 === 1 ? '-30px' : 'auto',
                      animationDelay: `${i * 0.5}s`,
                      zIndex: 10 - i
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${source.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{source.logo}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{source.name}</div>
                        <div className="text-green-400 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                          Synced
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Central Aggregation Hub */}
                <div className="relative ml-10 mt-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-primary-500/20 rounded-2xl blur-2xl" />
                  <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl border border-dark-700/50 p-6 shadow-2xl">
                    {/* Mock Dashboard Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-2 text-dark-400 text-xs">All Jobs • Live</span>
                    </div>
                    
                    {/* Aggregation Stats */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-green-400 font-medium text-sm">Jobs Aggregated Today</span>
                        <span className="text-green-400 text-xs px-2 py-0.5 bg-green-500/20 rounded-full">LIVE</span>
                      </div>
                      <div className="text-4xl font-bold text-white mb-2">247 <span className="text-lg text-dark-400">new jobs</span></div>
                      <div className="flex gap-2">
                        <span className="text-xs text-dark-400">From:</span>
                        <span className="text-xs text-purple-400">Accenture</span>
                        <span className="text-xs text-blue-400">TCS</span>
                        <span className="text-xs text-orange-400">Infosys</span>
                        <span className="text-xs text-dark-500">+47 more</span>
                      </div>
                    </div>

                    {/* Sample Jobs */}
                    <div className="space-y-2">
                      {['SDE @ Accenture', 'Analyst @ TCS', 'Dev @ Infosys'].map((job, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-dark-700/30 rounded-lg border border-dark-600/30">
                          <span className="text-white text-sm">{job}</span>
                          <span className="text-green-400 text-xs">New</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROBLEM WE SOLVE - New Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-red-900/5 to-dark-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            {/* Left - The Problem */}
            <div>
              <span className="text-red-400 font-medium text-xs sm:text-sm tracking-wider uppercase">The Problem</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2 mb-4 sm:mb-6">
                Students Miss Jobs Every Day
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { text: 'Checking 50+ company career pages daily' },
                  { text: 'Jobs filled before you even know about them' },
                  { text: 'Missing deadlines because of scattered information' },
                  { text: 'No idea which jobs match your skills' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                    <span className="text-dark-300 text-sm sm:text-base">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - The Solution */}
            <div>
              <span className="text-green-400 font-medium text-xs sm:text-sm tracking-wider uppercase">Our Solution</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2 mb-4 sm:mb-6">
                One Dashboard. Every Job.
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {[
                  { text: 'All jobs from 50+ MNCs in one place' },
                  { text: 'Get notified the moment new jobs are posted' },
                  { text: 'AI tells you which jobs match your resume' },
                  { text: 'Never miss a single opportunity again' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <span className="text-dark-300 text-sm sm:text-base">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHERE WE GET JOBS FROM */}
      <section className="py-12 sm:py-16 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              We Aggregate Jobs From
            </h2>
            <p className="text-dark-400 mt-2 text-sm sm:text-base">So you don't have to visit each one</p>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4">
            {jobSources.map((source, i) => (
              <div key={i} className="bg-dark-800/50 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-dark-700/50 hover:border-primary-500/30 transition-all text-center group">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 mx-auto rounded-lg sm:rounded-xl bg-gradient-to-br ${source.color} flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform`}>
                  <span className="text-white font-bold text-xs sm:text-sm">{source.logo}</span>
                </div>
                <p className="text-dark-400 text-[10px] sm:text-xs truncate hidden sm:block">{source.name}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-dark-500 text-xs sm:text-sm mt-4 sm:mt-6">+ 40 more sources being scraped daily</p>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="py-12 sm:py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-800/30 via-dark-900 to-dark-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary-400 font-medium text-xs sm:text-sm tracking-wider uppercase">Features</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              More Than Just Job Listings
            </h2>
            <p className="text-dark-400 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              We don't just show jobs. We help you land them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-dark-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-dark-700/50 hover:border-primary-500/30 transition-all h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center mb-4 sm:mb-6">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Real-Time Aggregation</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  Our scrapers run every few hours, pulling fresh jobs from 50+ company career pages.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-primary-400 text-xs sm:text-sm font-medium">
                  <span>Updated hourly</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-dark-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-dark-700/50 hover:border-purple-500/30 transition-all h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 sm:mb-6">
                  <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">AI Resume Matching</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  Upload your resume. Our AI extracts skills and tells you how well you match each job.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-purple-400 text-xs sm:text-sm font-medium">
                  <span>Smart AI Analysis</span>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative sm:col-span-2 md:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-dark-800/50 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-dark-700/50 hover:border-green-500/30 transition-all h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 sm:mb-6">
                  <FileCode className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">LaTeX Resume Builder</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  Generate ATS-friendly professional resumes in LaTeX format.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-green-400 text-xs sm:text-sm font-medium">
                  <span>Ultimate Plan</span>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - Timeline Style */}
      <section className="py-12 sm:py-20 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary-400 font-medium text-xs sm:text-sm tracking-wider uppercase">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              3 Steps to Your Dream Job
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-green-500 -translate-y-1/2" />
            
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: '01',
                  icon: Rocket,
                  title: 'Sign Up Free',
                  desc: 'Create your account in 30 seconds. No credit card required.',
                  color: 'from-primary-500 to-orange-500'
                },
                {
                  step: '02',
                  icon: FileText,
                  title: 'Upload Resume',
                  desc: 'Our AI extracts your skills and experience automatically.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  step: '03',
                  icon: Zap,
                  title: 'Get Matched',
                  desc: 'See match scores for every job. Apply to the best fits.',
                  color: 'from-green-500 to-emerald-500'
                }
              ].map((item, i) => (
                <div key={i} className="relative text-center">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 sm:mb-6 relative z-10`}>
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <span className="text-4xl sm:text-6xl font-black text-dark-800 absolute -top-2 sm:-top-4 left-1/2 -translate-x-1/2">{item.step}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                  <p className="text-dark-400 relative z-10 text-sm sm:text-base">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING - Modern Cards */}
      <section id="pricing" className="py-12 sm:py-20 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary-400 font-medium text-xs sm:text-sm tracking-wider uppercase">Pricing</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              Invest in Your Career
            </h2>
            <p className="text-dark-400 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              Less than a cup of coffee. More than a career upgrade.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-dark-700/50">
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-dark-400 font-medium text-xs sm:text-sm">Free</span>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-2xl sm:text-4xl font-bold text-white">₹0</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['Browse all jobs', 'Save jobs', 'Basic search', '1 AI match/mo'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-dark-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-dark-500 flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-2 sm:py-3 text-center rounded-lg sm:rounded-xl border border-dark-600 text-dark-300 hover:bg-dark-700/50 transition-all text-xs sm:text-sm">
                Get Started
              </Link>
            </div>

            {/* Basic Plus */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-primary-500/30">
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-primary-400 font-medium text-xs sm:text-sm">Basic Plus</span>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-2xl sm:text-4xl font-bold gradient-text">₹10</span>
                  <span className="text-dark-400 text-xs sm:text-sm">/mo</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['Everything in Free', 'Verified badge', '3 AI matches/mo', 'Ad-free'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-dark-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-2 sm:py-3 text-center rounded-lg sm:rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all text-xs sm:text-sm">
                Upgrade
              </Link>
            </div>

            {/* AI Match - Popular */}
            <div className="relative bg-gradient-to-b from-purple-500/10 to-dark-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30">
              <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-[10px] sm:text-xs font-bold">
                POPULAR
              </div>
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-purple-400 font-medium text-xs sm:text-sm">AI Match</span>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-2xl sm:text-4xl font-bold text-purple-400">₹20</span>
                  <span className="text-dark-400 text-xs sm:text-sm">/mo</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['Everything in Basic', '5 AI matches/mo', 'Match score', 'Skill insights', 'Priority'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-dark-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-2 sm:py-3 text-center rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all text-xs sm:text-sm">
                Get AI Match
              </Link>
            </div>

            {/* Ultimate */}
            <div className="relative bg-gradient-to-b from-yellow-500/10 to-dark-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-500/30">
              <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black text-[10px] sm:text-xs font-bold">
                ULTIMATE
              </div>
              <div className="text-center mb-4 sm:mb-6">
                <span className="text-yellow-400 font-medium text-xs sm:text-sm">Ultimate</span>
                <div className="flex items-baseline justify-center gap-1 mt-2">
                  <span className="text-2xl sm:text-4xl font-bold text-yellow-400">₹50</span>
                  <span className="text-dark-400 text-xs sm:text-sm">/mo</span>
                </div>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {['Everything in AI', 'Unlimited AI', 'LaTeX resume', 'ATS-optimized', 'Priority'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-dark-300">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full py-2 sm:py-3 text-center rounded-lg sm:rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all text-xs sm:text-sm">
                Go Ultimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary-500/10 to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-green-500/10 rounded-full blur-[100px] sm:blur-[150px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4 sm:mb-6">
            <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-green-400">For Students & Freshers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Stop Missing Jobs.
            <br />
            <span className="bg-gradient-to-r from-green-400 via-primary-400 to-purple-400 bg-clip-text text-transparent">
              Start Getting Hired.
            </span>
          </h2>
          <p className="text-sm sm:text-lg text-dark-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Every job from Accenture, TCS, Infosys & 50+ companies — in one place. 
            <br className="hidden sm:block" />
            <span className="text-green-400">Never miss an opportunity again.</span>
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all text-sm sm:text-base"
          >
            View All Jobs Free
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <p className="text-dark-500 text-xs sm:text-sm mt-3 sm:mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">J+</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-white">JobFinder+</span>
                <p className="text-dark-500 text-[10px] sm:text-xs">AI-Powered Job Aggregator</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/disclaimer" className="text-dark-400 hover:text-white transition-colors">
                Disclaimer
              </Link>
              <a href="#pricing" className="text-dark-400 hover:text-white transition-colors">
                Pricing
              </a>
              <Link to="/login" className="text-dark-400 hover:text-white transition-colors">
                Login
              </Link>
            </div>
            <p className="text-dark-500 text-xs sm:text-sm text-center">
              © {new Date().getFullYear()} JobFinder+
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
