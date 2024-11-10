"use client";
import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';

const page = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", name: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "ExpenseTree - Contact";
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      toast.success('Message sent successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      setForm({ email: "", name: "", message: "" });
    } else {
      toast.error('Oops! Message cannot be sent at this moment.', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="dark"
      />

      <section className="bg-gray-50 min-h-screen py-12 px-4 lg:px-0 flex justify-center items-center">
        <div className="container mx-auto max-w-4xl shadow-xl bg-white rounded-lg p-8 lg:p-12 relative">
          <h2 className="text-4xl font-bold text-green-600 text-center mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Have questions or need assistance? Drop us a message and we'll get back to you shortly!
          </p>


          {/* Contact Form */}
          <form className="space-y-6 relative z-20" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-semibold" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="outline-none text-black w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 transition shadow-sm"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 text-black py-3 border outline-none border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 transition shadow-sm"
                  placeholder="johndoe@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                className="w-full resize-none text-black outline-none px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 transition shadow-sm"
                placeholder="Type your message here..."
                required
              ></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-green-600 text-white py-3 px-4 rounded-full font-semibold hover:bg-green-700 transition shadow-lg"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>

        {/* Go Back Button */}
        <div className="fixed bottom-4 left-4 lg:top-4 lg:right-4">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-400 text-white px-4 py-2 rounded-md hover:bg-blue-300 transition font-medium text-sm lg:text-base"
          >
            Go Back
          </button>
        </div>
      </section>
    </>
  );
};

export default page;
