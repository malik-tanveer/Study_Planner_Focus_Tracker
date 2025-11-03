import { motion } from "framer-motion";
import { LogOut, Moon, Sun, BookOpen } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onLogout }) {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    return (
        <header className={`border-b backdrop-blur-xl sticky top-0 z-50 ${
            theme === "dark" ? "border-slate-800 bg-slate-900/70" : "border-gray-200 bg-white/80"
        }`}>
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                        theme === "dark" ? "bg-indigo-700/25 border-indigo-500/40" : "bg-indigo-100 border-indigo-200"
                    }`}>
                        <BookOpen className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                    </div>
                    <span className={`hidden sm:block font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Study Planner
                    </span>
                </div>


                {/* Right: User + Theme Toggle + Logout */}
                <div className="flex items-center gap-3">
                    
                    {/* User Display */}
                    <span className={`text-sm hidden sm:block truncate max-w-[120px] ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}>
                        {user?.displayName || user?.email?.split("@")[0] || "User"}
                    </span>

                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition flex items-center justify-center ${
                            theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-yellow-400" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </motion.button>

                    {/* Logout Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                            theme === "dark" ? "bg-slate-800 hover:bg-slate-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">Logout</span>
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
