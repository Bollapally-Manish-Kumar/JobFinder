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
  FileCode,
  Shield,
  MousePointer
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

// Job sources we aggregate from - with brand colors
const jobSources = [
  { name: 'Accenture', logo: 'A', bgColor: 'bg-[#A100FF]' },
  { name: 'TCS', logo: 'T', bgColor: 'bg-[#0052C2]' },
  { name: 'Infosys', logo: 'I', bgColor: 'bg-[#007CC3]' },
  { name: 'Wipro', logo: 'W', bgColor: 'bg-[#3F1D74]' },
  { name: 'LinkedIn', logo: 'in', bgColor: 'bg-[#0A66C2]' },
  { name: 'Naukri', logo: 'N', bgColor: 'bg-gradient-to-br from-[#4285F4] to-[#EA4335]' },
  { name: 'Indeed', logo: 'I', bgColor: 'bg-[#2164F3]' },
  { name: 'Wellfound', logo: 'W', bgColor: 'bg-black' },
];

function Home() {
  const jobCount = useCounter(1247);
  const companyCount = useCounter(50);
  const userCount = useCounter(500);

  // Enhanced structured data for Google rich results
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.goaxonai.in/#website",
        "name": "GoAxonAI",
        "url": "https://www.goaxonai.in",
        "description": "AI-powered job search platform aggregating 50+ sources",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.goaxonai.in/dashboard?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "SoftwareApplication",
        "name": "GoAxonAI",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "500"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is GoAxonAI?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "GoAxonAI is an AI-powered job search platform that aggregates jobs from 50+ sources including LinkedIn, Naukri, Indeed. It offers AI job matching, ATS-optimized resume builder, and smart job tracking."
            }
          },
          {
            "@type": "Question",
            "name": "Is GoAxonAI free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, GoAxonAI offers a free tier with access to all job listings and 1 AI match trial. Premium plans start at ₹10 for additional features."
            }
          },
          {
            "@type": "Question",
            "name": "How does AI Job Matching work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "AxonMatch™ analyzes your resume and compares it with job descriptions to find jobs you're actually eligible for. It uses AI to score job-resume fit and highlights matching skills."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <SEO
        title="GoAxonAI | AI Job Search Platform - Find Jobs from 50+ Sources Free"
        description="Find your dream job with AI. GoAxonAI aggregates 50+ job sources, uses AI to match jobs to your skills, and builds ATS-optimized resumes. Start free!"
        keywords="AI job search, job aggregator India, tech jobs India, remote jobs, freshers jobs 2026, software engineer jobs, AI resume builder, job matching AI, GoAxonAI, AxonMatch, AxonResume"
        url="https://www.goaxonai.in"
        structuredData={structuredData}
      />
      <Navbar />

      {/* HERO - Unique Split Design */}
      <section className="relative min-h-[90vh] lg:min-h-screen pt-20 flex items-center overflow-hidden">
        {/* Animated Background with Enhanced Mesh Gradient */}
        <div className="absolute inset-0 mesh-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-900/95 to-purple-900/20" />

          {/* Glowing orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/25 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-primary-500/15 to-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/15 rounded-full blur-[80px] float-slow" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] float-slow" style={{ animationDelay: '2s' }} />

          {/* Floating Particles */}
          <div className="particle w-2 h-2 bg-primary-500/40 top-[20%] left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="particle w-3 h-3 bg-purple-500/35 top-[30%] right-[15%]" style={{ animationDelay: '2s' }} />
          <div className="particle w-2 h-2 bg-pink-500/40 bottom-[25%] left-[20%]" style={{ animationDelay: '4s' }} />
          <div className="particle w-4 h-4 bg-primary-500/30 top-[60%] right-[25%]" style={{ animationDelay: '1s' }} />
          <div className="particle w-2 h-2 bg-cyan-500/35 top-[40%] left-[30%]" style={{ animationDelay: '3s' }} />
          <div className="particle w-3 h-3 bg-orange-500/25 top-[15%] right-[30%]" style={{ animationDelay: '5s' }} />
          <div className="particle w-2 h-2 bg-emerald-500/30 bottom-[40%] right-[10%]" style={{ animationDelay: '1.5s' }} />

          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="text-center lg:text-left">


              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6">
                Think Less.
                <br />
                <span className="relative inline-block">
                  <span className="animate-gradient-text">
                    Apply Smarter.
                  </span>
                  <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 150 4 298 10" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                        <stop stopColor="#f97316" />
                        <stop offset="0.5" stopColor="#a855f7" />
                        <stop offset="1" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-dark-300 max-w-lg mx-auto lg:mx-0 mb-8">
                Your <span className="text-white font-semibold">AI brain for job hunting</span>. We scan <span className="text-primary-400 font-semibold">50+ sources</span>, match your skills, and help you <span className="text-green-400 font-semibold">apply smarter — not harder</span>.
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

              {/* Stats with glow effects */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 justify-center lg:justify-start stagger-fade">
                <div className="text-center group cursor-default">
                  <div className="text-2xl sm:text-3xl font-bold text-white text-glow group-hover:scale-110 transition-transform">{jobCount}+</div>
                  <div className="text-xs sm:text-sm text-dark-400">Active Jobs</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-primary-500/30 to-transparent" />
                <div className="text-center group cursor-default">
                  <div className="text-2xl sm:text-3xl font-bold text-white text-glow group-hover:scale-110 transition-transform">{companyCount}+</div>
                  <div className="text-xs sm:text-sm text-dark-400">Companies</div>
                </div>
                <div className="w-px h-8 sm:h-10 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent" />
                <div className="text-center group cursor-default">
                  <div className="text-2xl sm:text-3xl font-bold text-white text-glow group-hover:scale-110 transition-transform">{userCount}+</div>
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
                      <div className={`w-10 h-10 rounded-full ${source.bgColor} flex items-center justify-center border border-white/10`}>
                        <span className="text-white font-bold text-sm">{source.logo}</span>
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
      <section className="py-12 sm:py-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800/50 to-dark-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
              We Aggregate Jobs From <span className="animate-gradient-text">50+ Sources</span>
            </h2>
            <p className="text-dark-400 mt-2 text-sm sm:text-base">So you don't have to visit each one</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-4">
            {jobSources.map((source, i) => (
              <div
                key={i}
                className="group relative bg-dark-800/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-dark-700/50 hover:border-primary-500/40 transition-all duration-300 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/10"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full overflow-hidden">
                  <div className={`absolute inset-0 ${source.bgColor} opacity-10`} />
                </div>
                <div className={`relative w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-full ${source.bgColor} flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-all duration-300 shadow-lg border border-white/10`}>
                  <span className="text-white font-bold text-xs sm:text-base">{source.logo}</span>
                </div>
                <p className="relative text-dark-400 text-[10px] sm:text-xs truncate hidden sm:block group-hover:text-white transition-colors">{source.name}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-dark-500 text-xs sm:text-sm mt-6 sm:mt-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/50 border border-dark-700/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              + 40 more sources being scraped daily
            </span>
          </p>
        </div>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-800/30 via-dark-900 to-dark-900" />
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-medium text-xs sm:text-sm tracking-wider uppercase mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              More Than Just <span className="animate-gradient-text">Job Listings</span>
            </h2>
            <p className="text-dark-400 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              We don't just show jobs. We help you land them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 0 - AxonApply - MAIN FEATURE */}
            <div className="group relative perspective-1000 sm:col-span-2 md:col-span-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-all duration-500 animate-pulse" />
              <div className="relative bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-orange-500/50 group-hover:border-orange-400 transition-all duration-500 h-full group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-orange-500/30">
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full text-black text-xs font-bold">
                  MAIN FEATURE
                </div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-orange-500/30">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-orange-400 transition-colors">
                  AxonApply™ <span className="text-orange-400">NEW</span>
                </h3>
                <p className="text-dark-300 leading-relaxed text-sm sm:text-base mb-4">
                  AI-assisted job application agent. Fills forms, uploads resumes, answers questions — <strong className="text-white">with you in control</strong>.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-dark-800/50 rounded text-xs text-dark-300 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" /> Legal & Safe
                  </span>
                  <span className="px-2 py-1 bg-dark-800/50 rounded text-xs text-dark-300 flex items-center gap-1">
                    <MousePointer className="w-3 h-3 text-purple-400" /> You Submit
                  </span>
                </div>
                <Link to="/axon-apply" className="inline-flex items-center gap-2 text-orange-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                  <span>Try AxonApply™</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 1 - AxonSearch */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-orange-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-dark-700/50 group-hover:border-primary-500/50 transition-all duration-500 h-full group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary-500/20">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-orange-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-primary-500/30">
                  <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-primary-400 transition-colors">AxonSearch™</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  AI-powered job aggregation from 50+ sources.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-primary-400 text-xs sm:text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>
            </div>

            {/* Card 2 - AxonMatch */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-dark-700/50 group-hover:border-purple-500/50 transition-all duration-500 h-full group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-purple-500/30">
                  <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-400 transition-colors">AxonMatch™</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  JD ↔ Resume match scores.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-purple-400 text-xs sm:text-sm font-medium">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                  <span>AI Powered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-6 max-w-2xl mx-auto">
            {/* Card 3 - AxonResume */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-dark-700/50 group-hover:border-green-500/50 transition-all duration-500 h-full group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-green-500/20">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-green-500/30">
                  <FileCode className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-green-400 transition-colors">AxonResume™</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  AI LaTeX resume builder. ATS-friendly.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-green-400 text-xs sm:text-sm font-medium">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Ultimate</span>
                </div>
              </div>
            </div>

            {/* Card 4 - AxonTrack */}
            <div className="group relative perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-all duration-500" />
              <div className="relative bg-dark-800/80 backdrop-blur-xl rounded-2xl p-5 sm:p-8 border border-dark-700/50 group-hover:border-blue-500/50 transition-all duration-500 h-full group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-blue-500/30">
                  <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors">AxonTrack</h3>
                <p className="text-dark-400 leading-relaxed text-sm sm:text-base">
                  Track applications, resumes, follow-ups.
                </p>
                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-blue-400 text-xs sm:text-sm font-medium">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Free</span>
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
                {['AxonApply™ Agent', 'Unlimited AI Match', 'AxonResume™', 'ATS-optimized', 'Priority'].map((f, i) => (
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
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-primary-500/10 to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[200px] sm:h-[400px] bg-orange-500/10 rounded-full blur-[100px] sm:blur-[150px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Find. Match. Apply.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              All with AI.
            </span>
          </h2>
          <p className="text-sm sm:text-lg text-dark-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            GoAxonAI helps you <strong className="text-white">find, match, and apply</strong> to jobs using AI — without spam or fake profiles.
            <br className="hidden sm:block" />
            <span className="text-green-400">Applications submitted only with your action.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/axon-apply"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl font-semibold text-black hover:shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transition-all text-sm sm:text-base"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Try AxonApply™
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-dark-600 rounded-xl font-semibold text-white hover:bg-dark-800/50 transition-all text-sm sm:text-base"
            >
              View All Jobs Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
          <p className="text-dark-500 text-xs sm:text-sm mt-3 sm:mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t border-dark-800 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Legal Disclaimer */}
          <div className="mb-8 sm:mb-10 p-4 bg-dark-800/50 rounded-xl border border-dark-700 text-center">
            <p className="text-dark-400 text-xs sm:text-sm flex items-center justify-center gap-2 flex-wrap">
              <Shield className="w-4 h-4 text-green-400" />
              <span>GoAxonAI provides AI-assisted application tools. Applications are submitted <strong className="text-dark-300">only with explicit user action</strong>.</span>
            </p>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="GoAxonAI" className="w-8 h-8" />
                <span className="text-lg font-bold text-white">GoAxon<span className="text-orange-500">AI</span></span>
              </div>
              <p className="text-dark-400 text-sm mb-4">Your AI Brain for Job Hunting. Find, match, and apply to jobs smarter.</p>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-white font-semibold mb-4">Products</h4>
              <ul className="space-y-2">
                <li><Link to="/ai-match" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">AxonMatch™</Link></li>
                <li><Link to="/resume-builder" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">AxonResume™</Link></li>
                <li><Link to="/axon-apply" className="text-dark-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2">AxonApply™ <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">Soon</span></Link></li>
                <li><Link to="/dashboard" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Job Dashboard</Link></li>
              </ul>
            </div>

            {/* Documentation */}
            <div>
              <h4 className="text-white font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">How It Works</a></li>
                <li><a href="#pricing" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Pricing Guide</a></li>
                <li><Link to="/axonapply/install" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Extension Setup</Link></li>
                <li><Link to="/disclaimer" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Terms & Privacy</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">About Us</a></li>
                <li><Link to="/disclaimer" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Contact</Link></li>
                <li><Link to="/disclaimer" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Disclaimer</Link></li>
                <li><Link to="/login" className="text-dark-400 hover:text-orange-400 transition-colors text-sm">Login</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} GoAxonAI. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/disclaimer" className="text-dark-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/disclaimer" className="text-dark-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
