/**
 * Privacy Policy Page
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Database, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
            <div className="w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
          </div>

          <div className="space-y-6 text-dark-300">
            <section>
              <p>
                This Privacy Policy explains how GoAxonAI collects, uses, and protects information when you use
                our website, dashboard, and related services (including AxonApply™).
              </p>
              <div className="mt-4 p-4 bg-dark-800/40 border border-dark-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-orange-400 mt-0.5" />
                  <p className="text-sm text-dark-300">
                    We aim to collect only what we need to provide the product. If you have privacy questions,
                    contact us anytime.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-500" />
                Information We Collect
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-white">Account info</strong>: email, password (for local accounts),
                  name, and authentication provider.
                </li>
                <li>
                  <strong className="text-white">Profile info</strong>: details you choose to provide for job
                  matching and AxonApply™ form filling (e.g., phone, location, education, experience, links).
                </li>
                <li>
                  <strong className="text-white">Resume info</strong>: if you upload a resume for matching, we
                  may store extracted resume text and timestamps.
                </li>
                <li>
                  <strong className="text-white">Payment-related info</strong>: if you purchase a plan, we may
                  store transaction identifiers you submit (e.g., UTR) and plan/verification status.
                </li>
                <li>
                  <strong className="text-white">Usage & diagnostics</strong>: basic logs/metadata used to keep
                  the service reliable (e.g., request timestamps, error reports). We do not intentionally collect
                  sensitive credentials.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">How We Use Information</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide core features (login, dashboard, saved jobs, AI tools, extension connectivity).</li>
                <li>Personalize experiences (job matching, profile-based autofill where enabled).</li>
                <li>Maintain security, prevent abuse, and enforce plan limits.</li>
                <li>Process and verify subscriptions and plan access.</li>
                <li>Support and communication (responding to your requests and questions).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Sharing of Information</h2>
              <p>
                We do not sell your personal information. We may share limited data with service providers
                (hosting, email, monitoring) strictly to operate GoAxonAI. We may also disclose information if
                required by law or to protect the platform from fraud or abuse.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Cookies & Local Storage</h2>
              <p>
                We may use cookies and browser storage to keep you signed in and to support basic site
                functionality. You can clear cookies/storage in your browser settings; doing so may sign you out.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Data Retention</h2>
              <p>
                We retain information for as long as your account is active or as needed to provide the service,
                comply with legal obligations, and resolve disputes. You can request account deletion by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Security</h2>
              <p>
                We use reasonable technical and organizational measures designed to protect your information.
                However, no method of transmission or storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>
                  For privacy questions or deletion requests, email{' '}
                  <a href="mailto:support@goaxonai.in" className="text-primary-400 hover:underline">
                    support@goaxonai.in
                  </a>
                  .
                </span>
              </p>
            </section>

            <div className="pt-6 border-t border-dark-700">
              <p className="text-sm text-dark-500">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
