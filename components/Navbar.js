"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/app/firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Listen for user authentication status changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid)); // Fetch user document
            if (userDoc.exists()) {
                // Spread the userDoc.data() to include all fields
                const userData = userDoc.data();
                setUser({
                    uid: currentUser.uid,
                    email: userData.email,
                    displayName: userData.displayName, // Ensure you're getting displayName
                    createdAt: userData.createdAt,
                    // Add any other fields you need here
                });
            } else {
                setUser(null); // Handle case where user data does not exist
            }
        } else {
            setUser(null); // User is not logged in
        }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-white shadow-md relative z-40">
  <nav className="container h-[70px] mx-auto p-4 flex flex-col md:grid md:grid-cols-3 items-center">
    {/* Logo */}
    <div className="flex items-center justify-between w-full md:justify-start mb-4 md:mb-0">
      <Link href="/" className="flex items-center">
        <Image src={"/logo.png"} width={40} height={10} alt="logo" />
        <span className="flex lg:text-2xl text-lg font-bold text-yellow-500 tracking-tight">
          Expense<h1 className="font-bold text-green-600">Tree</h1>
        </span>
      </Link>

      {/* Hamburger Icon for Mobile */}
      <button
        onClick={toggleMenu}
        className="md:hidden ml-2 text-gray-700 hover:text-green-600 focus:outline-none flex flex-col items-center gap-[2px]"
      >
        {/* Hamburger Icon */}
        <div className={`h-0.5 w-6 bg-gray-700 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <div className={`h-0.5 w-6 bg-gray-700 transition-opacity duration-300 ease-in-out my-1 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
        <div className={`h-0.5 w-6 bg-gray-700 transition-transform duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>
    </div>

    {/* Links - Hidden on Mobile */}
    <div className="hidden md:flex justify-center relative left-2 space-x-6 font-semibold mb-4 md:mb-0">
      <Link href="/" className="text-gray-700 hover:text-green-600 transition">
        Home
      </Link>
      <span onClick={() => user ? router.push('/dashboard') : router.push('/login')} className="hover:cursor-pointer text-gray-700 hover:text-green-600 transition">
        Dashboard
      </span>
      <a href="/contact" target='_blank' className="text-gray-700 hover:text-green-600 transition">
        Contact
      </a>
      <a href="/about" target='_blank' className="text-gray-700 hover:text-green-600 transition">
        About
      </a>
    </div>

    {/* Authentication Buttons - Right Side */}
    <div className="flex justify-center md:justify-end gap-2 items-center mb-4 md:mb-0">
      {user ? (
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-gray-700">
            <span className="text-blue-500">Welcome,</span> {user.displayName || "User"}! 
          </span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-2 rounded-md hover:bg-red-600 transition font-bold">
            Logout
          </button>
        </div>
      ) : (
        <>
          <Link href="/signup" className="hidden lg:block bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition font-bold">
            Sign Up
          </Link>
          <Link href="/login" className="hidden md:block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-bold">
            Login
          </Link>
        </>
      )}
    </div>

    {/* Mobile Menu */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 8.1 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-[62px] left-0 right-0 bg-white shadow-lg z-10"
        >
          <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-green-100">
            Home
          </Link>
          <span onClick={() => user ? router.push('/dashboard') : router.push('/login')} className="block px-4 py-2 text-gray-700 hover:bg-green-100">
            Dashboard
          </span>
          <a href="/contact" target='_blank' className="block px-4 py-2 text-gray-700 hover:bg-green-100">
            Contact
          </a>
          <a href="/about" target='_blank' className="block px-4 py-2 text-gray-700 hover:bg-green-100">
            About
          </a>
          {user ? (
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">
              Logout
            </button>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  </nav>
</header>



  );
};

export default Navbar;
