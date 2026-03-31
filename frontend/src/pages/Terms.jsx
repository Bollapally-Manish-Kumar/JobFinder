/**
 * Terms & Conditions Page
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, Ban, CreditCard, Scale, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

function Terms() {
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
            <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
          </div>

          <div className="space-y-6 text-dark-300">
            <section>
              <p>
                These Terms & Conditions govern your use of GoAxonAI and related services. By using GoAxonAI,
                you agree to these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-500" />
                Product Nature & User Control
              </h2>
              <p>
                GoAxonAI provides AI-assisted job discovery and productivity tools. When using AxonApply™, the
                agent may help you prepare application data, but final submission actions should remain under
                your control.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Accounts</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree to provide accurate information and keep your profile updated.</li>
                <li>We may suspend accounts involved in abuse, fraud, or security threats.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-400" />
                Plans, Payments & Access
              </h2>
              <p>
                Some features may require a paid plan. Plan access, limits, pricing, and verification steps may
                change over time. If you submit payment details (e.g., UTR), you represent that the payment is
                valid and authorized.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-400" />
                Acceptable Use
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Do not attempt to bypass plan limits, rate limits, or access controls.</li>
                <li>Do not abuse the platform (spamming, automated attacks, scraping private areas, etc.).</li>
                <li>Do not upload unlawful or infringing content.</li>
                <li>Do not attempt to bypass captchas or anti-bot protections on third-party sites.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-green-400" />
                Disclaimers & Limitation of Liability
              </h2>
              <p className="mb-3">
                GoAxonAI is provided on an “as is” and “as available” basis. We do not guarantee job availability,
                accuracy, interview outcomes, or hiring decisions.
              </p>
              <p>
                To the maximum extent permitted by law, GoAxonAI will not be liable for indirect or consequential
                damages arising from use of the service or third-party job platforms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Third-Party Services</h2>
              <p>
                Job listings and application flows may come from third-party APIs and employer platforms. Your
                use of third-party services is governed by their terms and policies.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Changes</h2>
              <p>
                We may update these Terms from time to time. Continued use of GoAxonAI after updates means you
                accept the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>
                  Questions about these Terms? Email{' '}
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

export default Terms;
