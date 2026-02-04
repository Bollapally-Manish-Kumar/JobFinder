/**
 * AxonApply™ Install Guide (No Chrome Web Store)
 */

import { Chrome, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

function AxonApplyInstall() {
  return (
    <div className="min-h-screen bg-dark-900">
      <SEO
        title="Install AxonApply™ Extension | GoAxonAI"
        description="Install AxonApply™ via Developer Mode (Load Unpacked). No servers, no code, no Chrome Web Store required."
        url="https://www.goaxonai.in/axonapply/install"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Chrome className="w-8 h-8 text-orange-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Install AxonApply™ (Developer Mode)</h1>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Download</h2>
          <a
            href="/axonapply-extension.zip"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            ⬇ Download AxonApply Extension (ZIP)
          </a>
          <p className="text-dark-500 text-sm mt-3">
            The ZIP is hosted directly by GoAxonAI at /public/axonapply-extension.zip.
          </p>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Step-by-step</h2>
          <ol className="list-decimal list-inside space-y-3 text-dark-300">
            <li>Download the AxonApply™ extension ZIP above.</li>
            <li>Unzip the folder on your computer (no code changes needed).</li>
            <li>Open a new tab and type <strong>chrome://extensions</strong> manually.</li>
            <li>Enable “Developer mode” (top-right).</li>
            <li>Click “Load unpacked” → select the unzipped axonapply-extension folder.</li>
            <li>Return to GoAxonAI and click “Connect Extension”.</li>
          </ol>
          <div className="mt-4 text-sm text-dark-400">
            ✅ No servers, no cloning, no setup. This is a client-side assistant only.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Security & Privacy</h3>
            </div>
            <ul className="text-dark-300 text-sm space-y-2">
              <li>• AxonApply™ runs only when you click Start.</li>
              <li>• No credentials are stored in localStorage or files.</li>
              <li>• Tokens are kept in extension session memory only.</li>
              <li>• No auto-submit. You review and click submit.</li>
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold">Legal-Safe Usage</h3>
            </div>
            <ul className="text-dark-300 text-sm space-y-2">
              <li>• AI-assisted apply (not auto-apply).</li>
              <li>• Captchas are never bypassed.</li>
              <li>• Uses your own browser session.</li>
              <li>• Applies only with explicit user action.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          Keep Chrome Developer Mode enabled for AxonApply™ to run. This is expected for unpublished extensions.
        </div>
      </div>
    </div>
  );
}

export default AxonApplyInstall;
