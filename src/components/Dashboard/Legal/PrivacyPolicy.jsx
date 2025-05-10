import React from 'react';
import Navbar from '../Navbar/Navbar';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b bg-[#002865]/90 text-white p-4 md:p-8">
        <div className="mt-5 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Privacy Policy
          </h1>

          <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
            {/* Last Updated */}
            <p className="text-gray-400 text-sm">Last Updated: April 26, 2025</p>

            {/* Introduction */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to Galaxy Cricket. We are committed to protecting your personal information and your right to privacy.
              </p>
            </section>

            {/* Information Collection */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>We collect information that you provide to us when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create an account</li>
                  <li>Complete KYC verification</li>
                  <li>Make transactions</li>
                  <li>Contact our support team</li>
                  <li>Subscribe to our newsletters</li>
                </ul>
              </div>
            </section>

            {/* Use of Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
              <div className="bg-blue-700/20 rounded-xl p-6">
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>To provide and maintain our service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>To notify you about changes to our service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>To provide customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>To detect, prevent and address technical issues</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            {/* Contact Section */}
            <section className="mt-8 bg-blue-700/20 rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300">
                If you have any questions about this Privacy Policy, please contact us at:
                <a
                  href="mailto:support@galaxy-cricket.com"
                  className="block mt-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  support@galaxy-cricket.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;