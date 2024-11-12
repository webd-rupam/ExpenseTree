"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { auth, db } from "@/app/firebase";
import { doc, getDoc } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';

const Homepage = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false)

  // Listen for user authentication status changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true)
        const userDoc = await getDoc(doc(db, "users", currentUser.uid)); 
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: currentUser.uid,
            email: userData.email,
            displayName: userData.displayName,
            createdAt: userData.createdAt,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getStarted = () => {
    router.push("/dashboard")
  }

  return (
    <>
    {loading && (
        // Loading Overlay
        <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-80"></div>
        </div>
      )}

      <section 
        className="relative bg-cover bg-center" 
        style={{ backgroundImage: "url('/bg.webp')", height: "100dvh" }}  // Use 100dvh for mobile
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>

        {/* Top Bar with Sign Up and Login buttons for mobile devices */}
        <div className="absolute md:hidden top-4 right-4 flex items-center gap-2 z-30">
          {!user ? (
            <>
              <Link href="/signup" className="bg-pink-500 text-white px-3 py-2 rounded-md hover:bg-pink-600 transition font-bold">
                Sign Up
              </Link>
              <Link href="/login" className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition font-bold">
                Login
              </Link>
            </>
          ) : null}
        </div>

        {/* Centered Welcome Message with Logout Button Below */}
        {user && (
          <div className="absolute md:hidden top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
            <span className="text-white text-center font-bold text-lg overflow-hidden whitespace-nowrap text-ellipsis">
              <span className='text-blue-400'>Welcome,</span> {user.displayName}!
            </span>
          </div>
        )}

        <motion.div
          className="container mx-auto flex flex-col justify-center items-center relative z-20 min-h-screen text-center py-24 lg:py-48"
          initial={{ opacity: 0, y: 100 }}  // Start off-screen and transparent
          animate={{ opacity: 1, y: 0 }}  // Slide in and become opaque
          transition={{ duration: 0.5 }} // Smooth and timed transition
        >
          <h2 className="lg:text-5xl text-3xl font-extrabold text-white mb-4 drop-shadow-lg">
            Manage Your Expenses with Ease
          </h2>
          <p className="text-xl text-white mb-8 drop-shadow-lg">
            Track, analyze, and grow your savings effortlessly with 
            <span className="text-yellow-500 tracking-tighter"> Expense<span className="text-green-600">Tree</span></span>.
          </p>
          <motion.button
            onClick={getStarted}
            className="bg-green-600 text-white py-3 px-8 relative left-3 rounded-full hover:bg-green-700 transition font-bold flex items-center gap-1"
            whileHover={{ scale: 1.1, y: -5 }} // Slight bounce on hover
            whileTap={{ scale: 0.9 }} // Scale down on click for a press effect
          >
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        </motion.div>

      </section>
    </>
  );
}

export default Homepage;
