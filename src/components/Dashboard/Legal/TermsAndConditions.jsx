import React from 'react';
import Navbar from '../Navbar/Navbar';
const TermsAndConditions = () => {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b bg-[#002865]/90 text-white p-4 md:p-8">
      <div className="mt-5 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r bg-white">
          Terms and Conditions
        </h1>

        <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
          {/* Last Updated Section */}
          <p className="text-[#1671CC] text-sm">Last Updated: April 26, 2025</p>

          {/* Acceptance Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                By accessing or using Galaxy Cricket, you agree to be bound by these Terms and Conditions.
                If you disagree with any part of the terms, you may not access our services.
              </p>
            </div>
          </section>

          {/* Eligibility Section */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">User Eligibility</h2>
            <div className="rounded-xl p-2">
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#1671CC]">•</span>
                  <span>You must be at least 18 years old</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1671CC]">•</span>
                  <span>You must be a resident of a jurisdiction where online gaming is legal</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1671CC]">•</span>
                  <span>You must complete KYC verification</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Account Rules */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Account Rules</h2>
            <div className="text-gray-300 leading-relaxed space-y-4">
              <p>
                Users are responsible for maintaining the confidentiality of their account 
                information and for all activities under their account.
              </p>
              <div className="rounded-xl p-2">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>One account per user</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>Accurate and current information required</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400">•</span>
                    <span>No sharing of accounts</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mt-8 rounded-xl p-2">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms, please contact us at:
              <a href="mailto:support@galaxy-cricket.com" 
                 className="block mt-2 text-blue-400 hover:text-blue-300 transition-colors">
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

export default TermsAndConditions;