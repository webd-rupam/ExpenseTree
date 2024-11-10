"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FaBars, FaTimes, FaPlus, FaHistory, FaChartPie, FaCog, FaDashcube, FaEdit, FaTrash  } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from "react";
import { auth, db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


const page = () => {
  const SidebarLink = ({ onClick, icon, label }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 w-full p-2 rounded hover:bg-zinc-700 text-left"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseCategories, setExpenseCategories] = useState({});
  const dropdownRef = useRef(null);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [loading, setloading] = useState(false)
  const [lastStoredMonth, setLastStoredMonth] = useState(null);
const [lastStoredYear, setLastStoredYear] = useState(null);

  const [filterCategory, setFilterCategory] = useState('');
const [sortOption, setSortOption] = useState('date');


  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const colors = [
    "#FF6384",  // Groceries
    "#36A2EB",  // Electronics
    "#FFCE56",  // Fashion
    "#4BC0C0",  // Utilities
    "#9966FF",  // Transportation
    "#FF9F40",  // Entertainment
    "#66FF66",  // Sports & Fitness
    "#FF6666",  // Dining Out
    "#33CCFF",  // Travel
    "#FFB3E6",  // Home & Garden
    "#669999",  // Insurance
    "#FFB6C1",  // Medicine & Health Care
    "#D4A017",  // Education
    "#C0C0C0",  // Charity
    "#FFD700",  // Personal Care
    "#A569BD",  // Subscriptions
    "#17A2B8",  // Bills
    "#7D3C98"   // Loans
  ];

  const CustomBar = (props) => {
    const { x, y, width, height, fill, index } = props;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index % colors.length]} // Dynamically assign color based on index
      />
    );
  };

  // Calculate analytics based on expenses
  const calculateAnalytics = (expenses) => {
    const categories = {};
    let total = 0;

    expenses.forEach((expense) => {
      total += expense.amount; // Sum total expenses
      if (expense.category) {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
      }
    });

    return { total, categories };
  };

  const data = Object.keys(expenseCategories).map(category => ({
    name: category,
    amount: expenseCategories[category],
  }));

  useEffect(() => {

    document.title = "ExpenseTree - Dashboard";

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        await fetchExpenses(user.uid);
        const { fetchedBudget, fetchedNotifications } = await fetchMonthlyBudget(user.uid);
        setNotificationsEnabled(fetchedNotifications); // Set the form value
        setMonthlyBudget(fetchedBudget);

        const { lastStoredMonth, lastStoredYear } = await fetchLastStoredMonthAndYear(user.uid);
      setLastStoredMonth(lastStoredMonth);
      setLastStoredYear(lastStoredYear);
        
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchExpenses = async (userId) => {
    try {
      setloading(true);
      const expensesQuery = query(collection(db, "expenses"), where("uid", "==", userId));
      const querySnapshot = await getDocs(expensesQuery);
  
      let expensesData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        expensesData.push(data);
      });
  
      const { total, categories } = calculateAnalytics(expensesData);
      setExpenses(expensesData);
      setTotalExpenses(total);
      setExpenseCategories(categories); // Update expense categories for chart
      
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setloading(false); // Ensure loading is set to false here
    }
  };
  

  const handleAddExpense = async (e) => {
    setloading(true)
    e.preventDefault();
    const expenseData = {
      date: e.target.elements.date.value,
      category: e.target.elements.category.value,
      amount: parseFloat(e.target.elements.amount.value),
      email: auth.currentUser?.email,
      uid: auth.currentUser?.uid,
      createdAt: new Date(),
    };
    try {
      await addDoc(collection(db, "expenses"), expenseData);
      checkDailyBudgetProgress();
      fetchExpenses(auth.currentUser?.uid); // Refresh expenses after adding

      e.target.reset(); // Clear the form fields

      toast.success('Expense added successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      setloading(false)
    } catch (error) {
      console.error("Error adding document: ", error);

      toast.error('Error adding Expense!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });

      setloading(false)
    }
  };

  const fetchMonthlyBudget = async (userId) => {
    setloading(true);
    try {
      const userQuery = query(collection(db, "users"), where("uid", "==", userId));
      const querySnapshot = await getDocs(userQuery);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const fetchedBudget = parseFloat(userDoc.data().monthlyBudget) || 0;
        const fetchedNotifications = userDoc.data().notificationsEnabled !== undefined 
        ? userDoc.data().notificationsEnabled
        : true; // Default to true if undefined
      return { fetchedBudget, fetchedNotifications };
      }
      return { fetchedBudget: 0, fetchedNotifications: true };
    } catch (error) {
      console.error("Error fetching monthly budget:", error);
      return { fetchedBudget: 0, fetchedNotifications: true };
    } finally {
      setloading(false); // Ensure loading is set to false here
    }
  };


const handleSaveSettings = async () => {
  if (auth.currentUser) {
    setloading(true);
    const userDocRef = doc(db, "users", auth.currentUser.uid);

    try {
      // Update user's monthly budget and notificationsEnabled flag
      await updateDoc(userDocRef, { monthlyBudget, notificationsEnabled });

      fetchExpenses(auth.currentUser?.uid);
      fetchMonthlyBudget(auth.currentUser?.uid);

      // Handle notification permission based on the flag
      if (notificationsEnabled) {
        if (Notification.permission !== "granted") {
          await Notification.requestPermission();
        }
      } else {
        // Disable notifications and reset tracking
        resetNotifications();
      }

      // Display success toast
      toast.success('Settings saved successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setloading(false);

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      console.error("Error updating settings: ", error);
      toast.error('Error saving Settings!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setloading(false);
    }
  }
};


  const handleEditExpense = async (expense) => {
    setEditExpense(expense);
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (editExpense) {
      try {
        setloading(true)
        await updateDoc(doc(db, "expenses", editExpense.id), {
          date: e.target.elements.date.value,
          category: e.target.elements.category.value,
          amount: parseFloat(e.target.elements.amount.value),
        });
        toast.success('Expense Updated successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        checkDailyBudgetProgress();
        setEditExpense(null);
        fetchExpenses(auth.currentUser?.uid);
        setloading(false)
      } catch (error) {
        console.error("Error updating expense:", error);
        setloading(false)

        toast.error('Error Updating Expense!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const confirmed = confirm("Are you sure you want to delete this expense?");
      
      if(confirmed) {
        setloading(true)
        await deleteDoc(doc(db, "expenses", id));

        toast.success('Expense Deleted successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        fetchExpenses(auth.currentUser?.uid);
        setloading(false)
      }

    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error('Error Deleting Expense!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      setloading(false)
    }
  };



  // reseting the budget and deleting the expenses monthly
  useEffect(() => {
    const checkForMonthChange = async () => {
      if (!auth.currentUser) {
        console.error("No user authenticated!");
        return;  // Exit if there's no authenticated user
      }
  
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
  
      // Fetch the last stored month and year only if auth.currentUser is available
      const { lastStoredMonth, lastStoredYear } = await fetchLastStoredMonthAndYear(auth.currentUser.uid);
  
      // If the current month and year are different from the last stored ones, perform a reset
      if (currentYear !== lastStoredYear || currentMonth !== lastStoredMonth) {
        // Perform the reset
        await resetMonthlyData(auth.currentUser.uid);
  
        // Save the current month and year to Firestore after the reset
        await saveCurrentMonthAndYear(auth.currentUser.uid, currentYear, currentMonth);
  
        toast.success('Monthly reset complete. Budgets and expenses are cleared for the new month.', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });

        if(notificationsEnabled){
          sendNotification("Monthly reset complete. Start your journey for the new month!");
        }
        
        window.location.reload();
      }
    };
  
    if (auth.currentUser) {
      checkForMonthChange();
    }
  }, [auth.currentUser]);
  
  // Function to fetch last stored month and year from Firestore
  const fetchLastStoredMonthAndYear = async (userId) => {
    setloading(true);

    // Check if userId is valid (non-null, non-undefined)
    if (!userId) {
        console.error("Invalid userId provided.");
        setloading(false);
        return { lastStoredMonth: new Date().getMonth(), lastStoredYear: new Date().getFullYear() };
    }
 

    try {
      
        const userQuery = query(collection(db, "users"), where("uid", "==", userId));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();

            const lastStoredMonth = data?.lastStoredMonth ?? new Date().getMonth();
            const lastStoredYear = data?.lastStoredYear ?? new Date().getFullYear();

            return { lastStoredMonth, lastStoredYear };
        }


        // Return default values if no document is found
        return { lastStoredMonth: new Date().getMonth(), lastStoredYear: new Date().getFullYear() };
    } catch (error) {
        console.error("Error fetching last stored month and year:", error);
        return { lastStoredMonth: new Date().getMonth(), lastStoredYear: new Date().getFullYear() }; // Fallback to current date
    } finally {
        setloading(false); // Ensure loading is set to false after the operation
    }
};

  
  // Function to save current month and year in Firestore
  const saveCurrentMonthAndYear = async (userId, year, month) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        lastStoredMonth: month,
        lastStoredYear: year,
      });
      console.log("Current month and year saved successfully");
    } catch (error) {
      console.error("Error saving current month and year:", error);
    }
  };
  
  // Function to reset monthly data (like clearing budget and expenses)
  const resetMonthlyData = async (userId) => {
    try {
      // Reset the monthly budget
      await updateDoc(doc(db, "users", userId), { monthlyBudget: 0 });
  
      // Delete all expenses for the user
      const expensesQuery = query(collection(db, "expenses"), where("uid", "==", userId));
      const querySnapshot = await getDocs(expensesQuery);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
  
      console.log("Monthly data reset successfully.");
    } catch (error) {
      console.error("Error resetting monthly data:", error);
    }
  };

  
  

  // Define percentage milestones you want to track based on total spending
  const notificationThresholds = [50, 90, 100]; // Milestones for actual budget spending percentage

  // To keep track of which thresholds have already been notified
  let notifiedThresholds = new Set();
  
  // Function to reset notifications when disabled
  const resetNotifications = () => {
    // Clear all notified thresholds when notifications are disabled
    notifiedThresholds.clear();
    console.log("Notifications have been disabled and reset.");
  };
  
  const checkDailyBudgetProgress = async () => {
    console.log("Running checkDailyBudgetProgress..."); // Top-level log
    if (auth.currentUser && notificationsEnabled) {
      const userId = auth.currentUser.uid;
      console.log("User ID:", userId); // Log user ID
  
      // Fetch daily expenses
      const dailyExpenses = await fetchDailyExpenses(userId);
      console.log("Fetched daily expenses:", dailyExpenses);
  
      // Fetch the user's monthly budget
      const { fetchedBudget: monthlyBudget } = await fetchMonthlyBudget(userId);
      if (!monthlyBudget) {
        console.log("No monthly budget found.");
        return;
      }
      console.log("Fetched monthly budget:", monthlyBudget);
  
      // Calculate daily budget and spending progress
      const dailyBudget = monthlyBudget / 30;
      const dailySpent = dailyExpenses.reduce((total, expense) => total + expense.amount, 0);
      const progress = (dailySpent / monthlyBudget) * 100;  // Calculate the percentage of total budget spent
  
      console.log("Daily Budget:", dailyBudget);
      console.log("Daily Spent:", dailySpent);
      console.log("Progress:", progress);
  
      // Check if progress exceeds 100% first, to avoid further checks
      if (progress > 100 && !notifiedThresholds.has('exceeded')) {
        sendNotification('You have exceeded your monthly budget limit!');
        notifiedThresholds.add('exceeded'); // Mark the 'exceeded' notification as sent
        return; // Stop further checks once we've exceeded
      }
  
      // Track the highest threshold reached
      let highestNotified = 0;
  
      // Check progress against each threshold (from highest to lowest)
      for (let threshold of notificationThresholds.reverse()) {
        // Only send notification if this threshold has not been reached yet
        if (progress >= threshold && !notifiedThresholds.has(threshold)) {
          sendNotification(`You have spent ${threshold}% of your monthly budget.`);
          notifiedThresholds.add(threshold); // Mark this threshold as notified
          highestNotified = threshold; // Track the highest threshold notified
          break; // Exit the loop after the first notification
        }
      }
  
      // Optionally, log which threshold was the highest notified
      if (highestNotified) {
        console.log(`Highest threshold notified: ${highestNotified}%`);
      }
    }
  };
  
  
  
  // Send a browser notification
  const sendNotification = (message) => {
    if (Notification.permission === "granted") {
      console.log("Notification permission granted.");
      new Notification("Daily Budget Alert", {
        body: message,
        icon: "/logo.png", // Replace with your app's icon
      });
      console.log("Notification sent:", message);
    } else {
      console.log("Notification permission not granted.");
    }
  };
  
// Fetch expenses for today
const fetchDailyExpenses = async (userId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const expensesQuery = query(
      collection(db, "expenses"),
      where("uid", "==", userId),
      where("createdAt", ">=", startOfDay),
      where("createdAt", "<=", endOfDay)
    );

    const querySnapshot = await getDocs(expensesQuery);

    let dailyExpenses = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      dailyExpenses.push(data);
    });

    return dailyExpenses;
  } catch (error) {
    console.error("Error fetching daily expenses:", error);
    return [];
  }
};


// for recent transactions
const [recentExpenses, setRecentExpenses] = useState([]);
  
useEffect(() => {
  const filterRecentExpenses = () => {
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2); // Get the timestamp for two hours ago

    // Filter expenses that are within the last 2 hours
    const filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.createdAt.seconds * 1000); // Assuming createdAt is a Firestore Timestamp
      return expenseDate >= twoHoursAgo; // Only include transactions within the last 2 hours
    });

    setRecentExpenses(filteredExpenses); // Update state with filtered expenses
  };

  filterRecentExpenses();
  
  const intervalId = setInterval(() => {
    filterRecentExpenses(); // Re-run the filter every minute to keep the data up-to-date
  }, 60000); // 60000 ms = 1 minute

  return () => clearInterval(intervalId); // Clean up the interval when component unmounts
}, [expenses]); // Re-run when expenses change



  const quotes = [
    '"Do not save what is left after spending, but spend what is left after saving." - Warren Buffett',
'"The stock market is filled with individuals who know the price of everything, but the value of nothing." - Philip Fisher',
'"The goal of retirement is to live off your income, not your savings." - Frank Eberhart',
'"An investment in knowledge pays the best interest." - Benjamin Franklin',
'"The four most dangerous words in investing are: \'This time it is different.\'" - Sir John Templeton',
'"Beware of little expenses; a small leak will sink a great ship." - Benjamin Franklin',
'"Time is the friend of the wonderful company, the enemy of the mediocre." - Warren Buffett',
'"The stock market is designed to transfer money from the active to the patient." - Warren Buffett',
'"In investing, what is comfortable is rarely profitable." - Robert Arnott',
'"If you want to be rich, be a long-term investor." - Warren Buffett',
'"You make most of your money in a bear market, you just don\'t realize it at the time." - Shelby Cullom Davis',
'"A penny saved is a penny earned." - Benjamin Franklin',
'"The biggest risk of all is not taking one." - Mellody Hobson',
'"The best investment you can make is in yourself." - Warren Buffett',
'"If you\'re not making mistakes, you\'re not taking risks." - John Sculley',
'"The rich invest in time, the poor invest in money." - Warren Buffett',
'"Know what you own, and know why you own it." - Peter Lynch',
'"Do not wait to buy real estate. Buy real estate and wait." - T. Harv Eker',
'"The only thing you can be sure of in life is that you will face financial setbacks." - Suze Orman',
'"Do not save what is left after spending, spend what is left after saving." - Warren Buffett',
'"Never depend on a single income. Make investment to create a second source." - Warren Buffett',
'"The goal of investing is not to beat the market, but to keep it from beating you." - Jack Bogle',
'"Risk comes from not knowing what you\'re doing." - Warren Buffett',
'"The most important quality for an investor is temperament, not intellect." - Warren Buffett',
'"Risk is not knowing what you\'re doing." - Warren Buffett',
'"Financial independence is the ability to live from the income of your own personal resources." - Jim Rohn',
'"In investing, it\'s not how much you make but rather how much you keep." - Warren Buffett',
'"The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb',
'"It is not your salary that makes you rich, it is your spending habits." - Charles A. Jaffe',
'"The most important thing to do if you find yourself in a hole is to stop digging." - Warren Buffett',
'"Price is what you pay. Value is what you get." - Warren Buffett',
'"Money grows on the tree of persistence." - Proverb',
'"You can\'t predict the future, but you can plan for it." - Dave Ramsey',
'"If you don\'t find a way to make money while you sleep, you will work until you die." - Warren Buffett',
'"Money is a terrible master but an excellent servant." - P.T. Barnum',
'"Wealth consists not in having great possessions, but in having few wants." - Epictetus',
'"Do not go where the path may lead, go instead where there is no path and leave a trail." - Ralph Waldo Emerson',
'"The way to wealth is to learn something new each day." - John D. Rockefeller',
'"The richest man is not he who has the most, but he who needs the least." - Unknown',
'"Invest in yourself. Your career is the engine of your wealth." - Paul Clitheroe',
'"The best way to predict your future is to create it." - Abraham Lincoln',
'"Never rely on a single source of income." - Warren Buffett',
'"There are no shortcuts to any place worth going." - Beverly Sills',
'"Success is the sum of small efforts, repeated day in and day out." - Robert Collier',
'"You do not have to be great to start, but you have to start to be great." - Zig Ziglar',
'"The only way to do great work is to love what you do." - Steve Jobs',
'"It always seems impossible until it\'s done." - Nelson Mandela',
'"Your time is limited, so don\'t waste it living someone else\'s life." - Steve Jobs',
'"Success is not final, failure is not fatal: It is the courage to continue that counts." - Winston Churchill'
  ];

  // State for storing the current quote index
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Set the initial quote index on page load
  useEffect(() => {
    const storedIndex = localStorage.getItem('quoteIndex');
    if (storedIndex) {
      setQuoteIndex(Number(storedIndex));
    }
  }, []);

  // Function to handle "Get More Quotes" button click
  const handleNextQuote = () => {
    let newIndex = quoteIndex + 1;
    if (newIndex >= quotes.length) {
      newIndex = 0;  // Loop back to the first quote
    }

    // Update the quote index and save it to localStorage
    setQuoteIndex(newIndex);
    localStorage.setItem('quoteIndex', newIndex);
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

      <div className="flex min-h-screen bg-gray-100 z-20">
        {/* Sidebar */}
        <div
          className={`fixed lg:relative z-20 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-zinc-600 flex flex-col items-center p-6 min-h-screen`}
        >
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white p-3 focus:outline-none self-end mb-4"
          >
            <FaTimes />
          </button>

          <div className="flex items-center justify-center mb-10 mr-11">
            <Image src="/logo.png" width={30} height={20} alt="ExpenseTree" className="mr-1" />
            <h1 className="text-2xl font-bold text-yellow-500">
              Expense<span className="text-green-600">Tree</span>
            </h1>
          </div>

          {/* Sidebar Links */}
          <nav className="space-y-4 w-full">
  <SidebarLink onClick={() => { setActiveSection('overview'); toggleSidebar(); }} icon={<FaDashcube />} label="Overview" />
  <SidebarLink onClick={() => { setActiveSection('addExpense'); toggleSidebar(); }} icon={<FaPlus />} label="Add Expense" />
  <SidebarLink onClick={() => { setActiveSection('expenseHistory'); toggleSidebar(); }} icon={<FaHistory />} label="Expense History" />
  <SidebarLink onClick={() => { setActiveSection('analytics'); toggleSidebar(); }} icon={<FaChartPie />} label="Analytics" />
  <SidebarLink onClick={() => { setActiveSection('settings'); toggleSidebar(); }} icon={<FaCog />} label="Settings" />
</nav>

          <button
            onClick={() => router.push('/')}
            className="bg-blue-400 text-white px-3 py-2 rounded-md hover:bg-blue-300 transition font-medium text-sm lg:text-base lg:mt-24 mt-40"
          >
            Go Back
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6 w-full">
  {/* Hamburger menu button for mobile */}
  <button
    onClick={toggleSidebar}
    className="lg:hidden text-green-600 p-2 focus:outline-none"
  >
    <FaBars size={24} />
  </button>

  {/* Option headings */}
  <div className="flex-1 text-center lg:text-left relative right-3 lg:right-0">
    <h2 className="text-2xl font-bold text-[#2C3E50]">
      {activeSection === 'overview' && "Overview"}
      {activeSection === 'addExpense' && "Add Expense"}
      {activeSection === 'expenseHistory' && "Expense History"}
      {activeSection === 'analytics' && "Analytics"}
      {activeSection === 'settings' && "Settings"}
    </h2>
  </div>
</header>

          {/* Conditional Rendering for Each Section */}

          {loading && (
  // Loading Overlay
  <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75"></div>
  </div>
) }

          {activeSection === 'overview' && (
  <section>
    {/* Dashboard Overview */}
    <div className="grid xl:grid-cols-3 gap-6 mb-6 xl:gap-6 lg:gap-12 lg:mb-12 xl:mb-6 md:mt-16 lg:mt-28 xl:mt-0 relative">
      <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-600">Total Expenses</h3>
        <p className="text-2xl font-bold text-gray-800">₹{totalExpenses}</p>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-600">Monthly Budget</h3>
        <p className="text-2xl font-bold text-gray-800">₹{monthlyBudget}</p>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-yellow-500">
        <h3 className="text-lg font-semibold text-gray-600">Savings</h3>
        <p className="text-2xl font-bold text-gray-800">₹{(monthlyBudget - totalExpenses) || 0}</p>
      </div>
    </div>

   {/* Recent Transactions */}
   <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 gap-6 mb-6 xl:mb-6 lg:mb-12 relative">
      <h3 className="text-xl font-semibold text-gray-700 mb-1">Recent Transactions</h3>
      {recentExpenses.length === 0 ? (
        <p className="text-gray-500 text-center pb-[84px] relative top-8">No recent transactions available.</p>
      ) : (
        <ul className="text-gray-700">
          {recentExpenses
            .sort((a, b) => new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000)) // Sort by createdAt (most recent first)
            .slice(0, 2) // Show only the first two transactions
            .map((expense, index) => (
              <li key={index} className="flex justify-between py-1 border-b">
                <span className="w-1/3">{expense.category}</span>
                <span className="w-1/3 text-center">{expense.date}</span>
                <span className="w-1/3 text-right font-semibold">₹{expense.amount}</span>
              </li>
            ))
          }
        </ul>
      )}

      {/* More button */}
      {recentExpenses.length > 2 && (
        <div className="text-right">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="text-blue-500 hover:text-blue-700 text-sm relative top-2"
          >
            View {`${recentExpenses.length - 2} more transactions`}
          </button>

          {/* Dropdown for additional transactions */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-full bg-white shadow-lg rounded-lg z-10 border border-gray-200"
              style={{ maxHeight: '200px', overflowY: 'auto' }}  // Max height with scrollbar
            >
              <ul onClick={() => { setShowDropdown(false) }} className="text-gray-700">
                {recentExpenses
                  .sort((a, b) => new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000)) // Sort by createdAt
                  .slice(2) // Remaining transactions after the first two
                  .map((expense, index) => (
                    <li key={index} className="flex justify-between py-2 px-4 border-b">
                      <span className="w-1/3 text-left">{expense.category}</span>
                      <span className="w-1/3 text-center">{expense.date}</span>
                      <span className="w-1/3 text-right font-semibold">₹{expense.amount}</span>
                    </li>
                  ))
                }
              </ul>
            </div>
          )}
        </div>
      )}
    </div>

{/* Inspirational Financial Quotes */}
<div className="bg-gradient-to-r from-orange-400 to-yellow-500 shadow-lg rounded-lg p-5 border border-gray-200 text-white text-center md:h-[245px] sm:h-[190px]">
  <h3 className="text-[21px] font-semibold mb-4 md:mb-12 text-gray-700 text-left ml-2">Financial Wisdom💡</h3>
  <p className="text-sm md:text-lg font-semibold mb-4">{quotes[quoteIndex]}</p>
  <div className="mt-1 md:mt-10">
    <button onClick={handleNextQuote} className="bg-green-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg hover:bg-green-600 text-sm">
      Get More Quotes
    </button>
  </div>
</div>

  </section>
)}


{activeSection === 'addExpense' && (
  <section className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
  <form onSubmit={handleAddExpense} className="space-y-6">
    <div>
      <label className="block text-gray-800 font-semibold mb-1">Date</label>
      <input 
        type="date" 
        name="date"  // Add this name attribute
        className="w-full p-3 border border-gray-400 text-gray-700 rounded-lg bg-gray-50 focus:border-green-600 focus:ring-1 focus:ring-green-300 transition ease-in-out"
      />
    </div>
    <div className="relative">
      <label className="block text-gray-800 font-semibold mb-1">Category</label>
      <select 
        name="category"  // Add this name attribute
        className="w-full p-3 border border-gray-400 text-gray-700 rounded-lg bg-gray-50 appearance-none focus:border-green-600 focus:ring-1 focus:ring-green-300 transition ease-in-out"
      >
        <option>Groceries</option>
  <option>Electronics</option>
  <option>Fashion</option>
  <option>Utilities</option>
  <option>Transportation</option>
  <option>Entertainment</option>
  <option>Sports & Fitness</option>
  <option>Dining Out</option>
  <option>Travel</option>
  <option>Home & Garden</option>
  <option>Insurance</option>
  <option>Medicine & Health Care</option>
  <option>Education</option>
  <option>Charity</option>
  <option>Personal Care</option>
  <option>Subscriptions</option>
  <option>Bills</option>
  <option>Loans</option>
      </select>
      <span className="absolute right-3 top-[46px] pointer-events-none text-gray-500">
        ▼
      </span>
    </div>
    <div>
      <label className="block text-gray-800 font-semibold mb-1">Amount</label>
      <div className="relative w-full">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
  <input 
    type="number" 
    name="amount"  
    placeholder="0.00" 
    className="w-full pl-8 p-3 border border-gray-400 text-gray-700 rounded-lg bg-gray-50 placeholder-gray-500 focus:border-green-600 focus:ring-1 focus:ring-green-300 transition ease-in-out"
  />
</div>
    </div>
    <button 
      type="submit"
      className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition ease-in-out disabled:cursor-not-allowed"
      disabled={loading}
    >
      {loading? "Adding..." : "Add Expense"}
      
    </button>
  </form>
</section>

)}


{activeSection === 'expenseHistory' && (
  <section>
    <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 border h-[85vh] border-gray-200 max-w-full overflow-auto lg:mt-8 sm:mt-4 relative lg:top-4 2xl:top-0 xl:mt-0 ">
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
        {/* Filter by Category */}
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <label className="text-blue-500">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border outline-none hover:cursor-pointer text-gray-600 border-gray-300 rounded p-2 mt-2 md:mt-0 md:ml-4 w-full md:w-auto"
          >
            <option value="">All</option>
            {[
              "Groceries",
              "Electronics",
              "Fashion",
              "Utilities",
              "Transportation",
              "Entertainment",
              "Sports & Fitness",
              "Dining Out",
              "Travel",
              "Home & Garden",
              "Insurance",
              "Medicine & Health Care",
              "Education",
              "Charity",
              "Personal Care",
              "Subscriptions",
              "Bills",
              "Loans",
            ].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort by Option */}
        <div className="flex flex-col md:flex-row items-start md:items-center">
          <label className="text-blue-500">Sort by:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border hover:cursor-pointer border-gray-300 outline-none rounded p-2 mt-2 md:mt-0 md:ml-4 w-full md:w-auto text-gray-600"
          >
            <option value="date">Date</option>
            <option value="amount">Price</option>
          </select>
        </div>
      </div>

      {/* Filtered Expenses or No Match Message */}
      {expenses.length === 0 ? (
        <p className="text-gray-500 text-center relative top-28">No expenses found.</p>
      ) : (
        (() => {
          const filteredExpenses = expenses
            .filter((expense) =>
              filterCategory ? expense.category === filterCategory : true
            )
            .sort((a, b) => {
              if (sortOption === 'date') {
                return new Date(b.createdAt.seconds * 1000) - new Date(a.createdAt.seconds * 1000) // Sort by createdAt
              } else {
                return b.amount - a.amount; // Sort by amount (highest first)
              }
            });

          return filteredExpenses.length === 0 ? (
            <p className="text-gray-500 text-center">No expenses match the selected category.</p>
          ) : (
            <ul className="space-y-4 mt-8 xl:max-h-[475px] md:max-h-[860px] max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {filteredExpenses.map((expense) => (
                <li key={expense.id} className="flex flex-col sm:flex-row justify-between items-center py-2 border-b space-y-2 sm:space-y-0">
                  {editExpense && editExpense.id === expense.id ? (
                    <form onSubmit={handleUpdateExpense} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                      {/* Category Dropdown for Editing */}
                      <select
                        name="category"
                        defaultValue={expense.category}
                        className="border rounded p-1 w-full sm:w-1/4 text-gray-600"
                      >
                        <option value="Groceries">Groceries</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Sports & Fitness">Sports & Fitness</option>
                        <option value="Dining Out">Dining Out</option>
                        <option value="Travel">Travel</option>
                        <option value="Home & Garden">Home & Garden</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Medicine & Health Care">Medicine & Health Care</option>
                        <option value="Education">Education</option>
                        <option value="Charity">Charity</option>
                        <option value="Personal Care">Personal Care</option>
                        <option value="Subscriptions">Subscriptions</option>
                        <option value="Bills">Bills</option>
                        <option value="Loans">Loans</option>
                      </select>

                      {/* Date Input */}
                      <input
                        name="date"
                        defaultValue={expense.date}
                        type="date"
                        className="border rounded p-1 w-full sm:w-1/4 text-gray-600"
                      />

                      {/* Amount Input */}
                      <div className="relative w-full sm:w-1/4">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
  <input
    name="amount"
    defaultValue={expense.amount}
    type="number"
    className="border rounded p-1 w-full pl-8 text-gray-600"
  />
</div>


                      <div className="flex gap-3 justify-center sm:justify-start">
                        <button type="submit" className="text-blue-500 hover:text-blue-700 font-medium">Save</button>
                        <button onClick={() => setEditExpense(null)} className="text-red-500 hover:text-red-700 font-medium">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Display Category, Date, and Amount */}
                      <span className="w-full sm:w-1/4 text-center text-lg sm:text-left text-gray-800">{expense.category}</span>
                      <span className="w-full relative sm:w-1/4 text-center text-gray-800">{expense.date}</span>
                      <span className="w-full relative lg:left-20 sm:w-1/4 text-right sm:text-left font-semibold text-gray-800">₹{expense.amount}</span>

                      <div className="flex space-x-4 justify-center sm:justify-start">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          );
        })()
      )}
    </div>
  </section>
)}




{activeSection === 'analytics' && (
   <section className="bg-white shadow-md rounded-lg lg:p-3 p-1 h-[84vh] lg:mt-14 2xl:mt-0">
   <div className="mb-3 h-[77vh] md:h-[79vh] lg:h-[79vh] xl:h-[76vh] bg-gray-200 flex items-center justify-start p-4"> 
     {data && data.length > 0 ? (
       <ResponsiveContainer width="100%" height="100%" className="ml-[-24px]">
         <BarChart data={data} layout="vertical">
           <XAxis type="number" />
           <YAxis type="category" dataKey="name" tick={false} /> 
           <Tooltip contentStyle={{ color: 'black' }} /> 
           <Bar dataKey="amount" shape={<CustomBar />}>
           </Bar>
         </BarChart>
       </ResponsiveContainer>
     ) : (
       <p className="text-gray-500 relative left-[18%]">No data available for analytics.</p>
     )}
   </div>
   <p className="text-gray-500">Tip: Click/Hover on the bars to get its details.</p>
</section>

)}

{activeSection === 'settings' && (
  <section className="bg-white shadow-md rounded-lg p-6 mt-10">
   
    <div className="space-y-5">
      
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Monthly Budget</label>
        <div className="relative w-full">
  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
  <input
    type="number"
    onChange={(e) => setMonthlyBudget(e.target.value)}
    placeholder="0.00" 
    value={monthlyBudget}
    className="w-full pl-8 p-2 border rounded text-gray-500"
  />
</div>

      </div>
      <div>
        <label className="block text-gray-800 font-semibold mb-1">Notifications</label>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">{notificationsEnabled ? "Enabled" : "Disabled"}</span>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-green-500"
          />
        </div>
    </div>
      <button onClick={handleSaveSettings} className="w-full bg-green-500 text-white p-2 rounded mt-16 hover:bg-green-700 transition ease-in-out"> {loading ? "Saving..." : "Save Settings"}</button>
    </div>
  </section>
)}

        </div>
      </div>
    </>
  );
};

export default page;
