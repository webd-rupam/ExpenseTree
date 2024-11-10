"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const page = () => {
  const router = useRouter();

  useEffect(() => {
    document.title = "ExpenseTree - Privacy Policy";
  }, [])

  return (
    <section className="min-h-screen py-12 px-4 lg:px-0 bg-gray-50 text-gray-800 relative">
      <div className="container mx-auto max-w-5xl p-8 lg:p-12 bg-white rounded-lg shadow-lg">

        <h1 className="text-4xl font-bold text-center mb-6 text-green-600">
          Privacy Policy
        </h1>
        
        <p className="text-gray-700 text-center mb-8 text-lg">
          Your privacy is important to us. This Privacy Policy explains how ExpenseTree collects, uses, and protects your information.
        </p>
        
        <div className="space-y-8">
          {/* Data Collection */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700">
              We collect information you provide directly to us when you sign up for an account, use our services, or communicate with us. This includes your name, email address, and any other information you choose to provide.
            </p>
            <p className="text-gray-700 mt-2">
              We may also collect information automatically, such as usage data, cookies, and other tracking technologies, to improve our services.
            </p>
          </div>
          
          {/* Usage of Information */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700">
              The information we collect is used to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
              <li>Provide, maintain, and improve our services.</li>
              <li>Personalize your experience on ExpenseTree.</li>
              <li>Respond to your comments, questions, and requests.</li>
              <li>Send updates and security alerts.</li>
              <li>Analyze usage and improve site performance.</li>
            </ul>
          </div>

          {/* Data Sharing */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700">
              We do not share your personal information with third parties, except when required by law, to protect our rights, or in connection with a business transaction such as a merger or acquisition. 
            </p>
          </div>

          {/* Data Security */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700">
              We take reasonable measures to protect your information from unauthorized access, loss, misuse, or alteration. However, no data transmission over the internet is completely secure, so we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Choices */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              5. Your Choices
            </h2>
            <p className="text-gray-700">
              You can update, correct, or delete your account information at any time by logging into your account. If you wish to deactivate your account or request that we no longer use your information, please contact us.
            </p>
          </div>

          {/* Policy Updates */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              6. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We encourage you to review this page periodically for the latest information on our privacy practices.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              7. Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us at our <a href="/contact" target='_blank' className="text-blue-500 hover:underline">Contact Page</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Go Back Button */}
      <div className="fixed bottom-4 left-4 lg:top-4 lg:left-4">
        <button
          onClick={() => router.push('/')}
          className="bg-blue-400 text-white px-4 py-2 rounded-md hover:bg-blue-300 transition font-medium text-sm lg:text-base"
        >
          Go Back
        </button>
      </div>
    </section>
  );
};

export default page;
