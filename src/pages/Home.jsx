// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpenCheck } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-slate-900 to-black text-white px-6">
      {/* Logo + Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30 shadow-lg mb-4">
          <BookOpenCheck className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Study Planner & Focus Tracker</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Organize your study subjects, stay focused with Pomodoro timer, and
          track your performance visually.
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          to="/login"
          className="px-6 py-3 bg-indigo-600 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-6 py-3 border border-indigo-500 rounded-lg font-semibold text-indigo-400 hover:bg-indigo-600/10 transition"
        >
          Sign Up
        </Link>
      </motion.div>

      <p className="text-gray-500 text-xs mt-12">
        © {new Date().getFullYear()} Study Planner – Designed for Learners 🚀
      </p>
    </div>
  );
};

export default Home;
