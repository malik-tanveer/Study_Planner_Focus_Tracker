import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex justify-between items-center px-6 py-3">
      <h1 className="text-xl font-semibold text-indigo-400">
        Study Planner 📘
      </h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg text-sm font-semibold"
      >
        Logout
      </button>
    </nav>
  );
}
