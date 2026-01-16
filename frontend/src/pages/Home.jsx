/**
 * Home Page - Landing page with hero, features, and pricing
 */

import { Link } from 'react-router-dom';
import { 
  Search, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  Building2, 
  Users, 
  Laptop,
  Sparkles,
  ArrowRight,
  BadgeCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';

const categories = [
  { name: 'IT Jobs', icon: Laptop, count: '500+' },
  { name: 'Internships', icon: Users, count: '200+' },
  { name: 'Freshers', icon: Sparkles, count: '300+' },
  { name: 'Remote', icon: Building2, count: '150+' },
];

const howItWorks = [
  {
    icon: Search,
    title: 'We Collect Jobs',
    description: 'Access all jobs from Accenture, TCS, Infosys & other top companies in one place.'
  },
  {
    icon: CheckCircle,
    title: 'We Verify',
    description: 'Every job listing is verified and comes directly from official company career pages.'
  },
  {
    icon: Clock,
    title: 'You Apply Early',
    description: 'Get notified about new opportunities before they fill up. Stay ahead of the competition.'
  },
];

const features = [
  'Unlimited job access',
  'Resume LaTeX generator',
  'Verified Badge',
  'Save & track jobs',
  'Early notifications',
  'Ad-free experience'
];

function Home() {
  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JobFinder+",
    "url": "https://jobfinderplus.vercel.app",
    "description": "Find tech jobs from top companies like Accenture, TCS, Infosys. AI-powered resume builder and job matching platform.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://jobfinderplus.vercel.app/dashboard?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      <SEO 
        title="JobFinder+ | Find Every Job Before You Miss It"
        description="Find tech jobs from Accenture, TCS, Infosys, and top startups. AI-powered resume builder, job matching, and application tracking. Get hired faster with JobFinder+."
        keywords="jobs, careers, job search, IT jobs, software jobs, fresher jobs, internships, remote jobs, AI resume builder, job matching, tech jobs India, Accenture jobs, TCS careers, Infosys hiring"
        url="https://jobfinderplus.vercel.app"
        structuredData={structuredData}
      />
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative pt-20 md:pt-24 pb-12 md:pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 stars-bg opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Find Every Job.
                <br />
                <span className="gradient-text">Before You Miss It.</span>
              </h1>
              <p className="mt-4 md:mt-6 text-base md:text-lg text-dark-300 max-w-xl mx-auto lg:mx-0">
                Jobs from Accenture, TCS, Infosys, Startups & Career Portals - in one place.
                Never miss an opportunity again.
              </p>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Link to="/register" className="btn-primary text-center py-2.5 md:py-3 px-6 md:px-8 text-base md:text-lg">
                  View Jobs
                </Link>
                <Link to="/login" className="btn-secondary text-center py-2.5 md:py-3 px-6 md:px-8 text-base md:text-lg">
                  Login
                </Link>
              </div>
            </div>

            {/* Hero image placeholder */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
                <div className="relative card p-8 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 animate-pulse-slow">
                      <Briefcase className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">1000+ Jobs</p>
                    <p className="text-dark-400">Updated Daily</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-16 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="card card-hover p-4 md:p-6 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full bg-primary-500/10 flex items-center justify-center mb-3 md:mb-4">
                  <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-dark-400 text-sm md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 md:mb-12">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((category, index) => (
              <div
                key={index}
                className="card card-hover p-4 md:p-6 text-center cursor-pointer"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto rounded-lg bg-primary-500/10 flex items-center justify-center mb-2 md:mb-3">
                  <category.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
                </div>
                <h3 className="font-semibold text-white text-sm md:text-base">{category.name}</h3>
                <p className="text-xs md:text-sm text-dark-400 mt-1">{category.count} jobs</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-dark-400 max-w-2xl mx-auto">
              Choose the plan that fits your job search needs. No hidden fees.
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            {/* Basic Plus - ₹10 */}
            <div className="card p-6 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                    Basic Plus
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-xl text-dark-400">₹</span>
                    <span className="text-4xl font-bold gradient-text">10</span>
                    <span className="text-dark-400">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-dark-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* AI Match - ₹20 */}
            <div className="card p-6 relative overflow-hidden border-2 border-purple-500/50">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="relative">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                    🤖 AI Match
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-xl text-dark-400">₹</span>
                    <span className="text-4xl font-bold text-purple-400">20</span>
                    <span className="text-dark-400">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-dark-300">All Basic Plus features</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-dark-300">AI-powered job matching</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-dark-300">Resume skill analysis</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-dark-300">Match score for each job</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-dark-300">Missing skills insights</span>
                  </li>
                </ul>

                <Link
                  to="/register"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white transition-all"
                >
                  Get AI Match
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Pro Plus - ₹30 */}
            <div className="card p-6 relative overflow-hidden border-2 border-yellow-500/50">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                  PRO
                </span>
              </div>
              
              <div className="relative">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    👑 Pro Plus
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-4">
                    <span className="text-xl text-dark-400">₹</span>
                    <span className="text-4xl font-bold text-yellow-400">30</span>
                    <span className="text-dark-400">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">All AI Match features</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">Priority support <span className="text-yellow-500 text-xs">(Coming Soon)</span></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">Advanced analytics <span className="text-yellow-500 text-xs">(Coming Soon)</span></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">Resume templates <span className="text-yellow-500 text-xs">(Coming Soon)</span></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">Interview tips <span className="text-yellow-500 text-xs">(Coming Soon)</span></span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-dark-300">Salary insights <span className="text-yellow-500 text-xs">(Coming Soon)</span></span>
                  </li>
                </ul>

                <div className="relative">
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90 text-black transition-all"
                  >
                    Go Pro
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="coming-soon-badge absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-dark-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary-500/30 whitespace-nowrap border border-primary-400">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">J+</span>
              </div>
              <span className="text-lg font-bold text-white">JobFinder+</span>
            </div>
            <div className="text-center">
              <Link to="/disclaimer" className="text-primary-400 text-xs hover:underline">
                Disclaimer - We are not affiliated with employers
              </Link>
            </div>
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} JobFinder+. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
