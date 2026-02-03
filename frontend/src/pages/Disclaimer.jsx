/**
 * Disclaimer Page - Legal disclaimer about job listings
 */

import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Shield, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';

function Disclaimer() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-24">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Disclaimer</h1>
          </div>

          <div className="space-y-6 text-dark-300">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                Not Affiliated with Employers
              </h2>
              <p>
                GoAxon AI is an independent job aggregation platform. We are <strong className="text-white">not affiliated with, endorsed by, or officially connected</strong> to any of the companies, organizations, or employers whose job listings appear on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Job Listing Sources</h2>
              <p className="mb-3">
                All job listings displayed on GoAxon AI are sourced from publicly available APIs and official job boards, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Adzuna API</li>
                <li>Arbeitnow API</li>
                <li>Remotive API</li>
                <li>The Muse API</li>
              </ul>
              <p className="mt-3">
                We do not scrape or collect data from private company websites without authorization.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Application Process</h2>
              <p>
                When you click "Apply" on any job listing, you will be redirected to the original source or the employer's official application page. GoAxon AI does not process job applications directly. All applications are submitted directly to the employers through their official channels.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">No Guarantee of Employment</h2>
              <p>
                GoAxon AI makes no guarantees regarding employment outcomes. We provide a platform to discover job opportunities, but hiring decisions are made solely by the respective employers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Accuracy of Information</h2>
              <p>
                While we strive to display accurate and up-to-date job listings, we cannot guarantee the accuracy, completeness, or availability of any job posting. Job details, including salary, location, and requirements, are provided by the original sources and may change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Paid Features</h2>
              <p>
                GoAxon AI offers premium features such as unlimited job access, AI job matching, and resume generation tools. These paid features enhance your job search experience but do not guarantee employment or interview callbacks.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Contact Us</h2>
              <p>
                If you have any questions or concerns about our platform, please contact us at{' '}
                <a href="mailto:support@goaxonai.in" className="text-primary-400 hover:underline">
                  support@goaxonai.in
                </a>
              </p>
            </section>

            <div className="pt-6 border-t border-dark-700">
              <p className="text-sm text-dark-500">
                Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Disclaimer;
