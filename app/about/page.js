"use client";
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


const page = () => {
    const router = useRouter()
    useEffect(() => {
      document.title = "ExpenseTree - About";
    }, [])
  return (
    <section className="min-h-screen py-12 px-4 lg:px-0 bg-gray-50 text-gray-800">
      <div className="container mx-auto max-w-5xl p-8 lg:p-12 bg-white rounded-lg shadow-lg">
        
        <h1 className="text-4xl font-bold text-center mb-6 text-green-600">
          About ExpenseTree
        </h1>
        
        <p className="text-lg text-gray-700 text-center mb-8">
          Your trusted companion in financial management, helping you make sense of your expenses and achieve financial peace.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* About ExpenseTree */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-green-600">
              What is ExpenseTree?
            </h2>
            <p className="text-gray-700">
              ExpenseTree is a powerful tool designed to assist individuals and businesses in tracking their expenses and managing their finances effectively. Our goal is to simplify the process of budgeting, allowing users to have full control over their financial life.
            </p>
            <p className="text-gray-700">
              Whether you are saving up for a big purchase, trying to control monthly expenses, or analyzing spending patterns, ExpenseTree provides the insights and tools necessary to make informed financial decisions.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-green-600">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Easy-to-use interface for tracking daily expenses</li>
              <li>Detailed reports and insights on spending patterns</li>
              <li>Secure data handling and privacy-focused design</li>
              <li>Customizable categories and budget goals</li>
              <li>Mobile-friendly for on-the-go access</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-green-600 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700">
            At ExpenseTree, our mission is to empower individuals and businesses to take control of their finances. We believe that financial literacy and good money management lead to a better, stress-free life.
          </p>
        </div>

         {/* Contact Information */}
         <div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4 mt-12 text-center">
              Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy or our data practices, please contact us at our <a href="/contact" target='_blank' className="text-blue-500 hover:underline">Contact Page</a>.
            </p>
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
}

export default page;
