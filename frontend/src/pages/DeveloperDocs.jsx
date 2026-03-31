/**
 * Developer Docs Page
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Terminal, Database, Puzzle, ShieldCheck, ExternalLink, User, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

function DeveloperDocs() {
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
            <div className="w-12 h-12 rounded-full bg-primary-500/15 flex items-center justify-center">
              <Code className="w-6 h-6 text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Developer Docs</h1>
          </div>

          <div className="space-y-6 text-dark-300">
            <section>
              <p>
                This page is a quick guide for developing and running GoAxonAI locally (frontend, backend, and
                the AxonApply™ extension folder).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-orange-400" />
                Requirements
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Node.js 18+</li>
                <li>PostgreSQL (or your configured Prisma datasource)</li>
                <li>Environment variables for backend (see below)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                Backend (Express + Prisma)
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-dark-800/40 border border-dark-700 rounded-xl">
                  <p className="text-sm text-dark-300">
                    Folder: <strong className="text-white">backend/</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-dark-300 mt-2">
                    <li><strong className="text-white">npm install</strong></li>
                    <li><strong className="text-white">npm run db:generate</strong></li>
                    <li><strong className="text-white">npm run db:push</strong> (or <strong className="text-white">npm run db:migrate</strong>)</li>
                    <li><strong className="text-white">npm run dev</strong></li>
                  </ul>
                </div>

                <div className="p-4 bg-dark-800/40 border border-dark-700 rounded-xl">
                  <h3 className="text-white font-semibold mb-2">Common env vars</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-dark-300">
                    <li><strong className="text-white">DATABASE_URL</strong></li>
                    <li><strong className="text-white">JWT_SECRET</strong></li>
                    <li><strong className="text-white">FRONTEND_URL</strong> (for CORS)</li>
                    <li><strong className="text-white">PORT</strong></li>
                    <li><strong className="text-white">GROQ_API_KEY</strong> / other AI provider keys (if enabled)</li>
                  </ul>
                  <p className="text-xs text-dark-500 mt-2">
                    Note: exact keys can vary depending on which features you enable.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Puzzle className="w-5 h-5 text-purple-400" />
                Frontend (Vite + React)
              </h2>
              <div className="p-4 bg-dark-800/40 border border-dark-700 rounded-xl">
                <p className="text-sm text-dark-300">
                  Folder: <strong className="text-white">frontend/</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-dark-300 mt-2">
                  <li><strong className="text-white">npm install</strong></li>
                  <li><strong className="text-white">npm run dev</strong></li>
                  <li><strong className="text-white">npm run build</strong> / <strong className="text-white">npm run preview</strong></li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                AxonApply™ Extension
              </h2>
              <p className="mb-3">
                The extension source is in <strong className="text-white">axonapply-extension/</strong>. For
                local testing, use Chrome → <strong className="text-white">Developer mode</strong> → “Load
                unpacked”.
              </p>
              <p className="text-sm text-dark-400 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                <span>
                  Install guide: <Link to="/axonapply/install" className="text-primary-400 hover:underline">/axonapply/install</Link>
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-orange-400" />
                Maintainer
              </h2>
              <div className="p-4 bg-dark-800/40 border border-dark-700 rounded-xl">
                <p className="text-sm text-dark-300">
                  Developed and maintained by <strong className="text-white">Bollapally Manish Kumar</strong>.
                </p>
                <p className="text-sm text-dark-400 mt-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:goaxonai@gmail.com" className="text-primary-400 hover:underline">
                    goaxonai@gmail.com
                  </a>
                </p>
              </div>
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

export default DeveloperDocs;
