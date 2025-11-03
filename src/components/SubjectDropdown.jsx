// Subject Dropdown with CS Subjects
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const CS_SUBJECTS = [
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Databases",
    "Networking",
    "Web Development",
    "Mobile Development",
    "Software Engineering",
    "AI/ML",
    "Computer Architecture",
];

export default function SubjectDropdown({ onSelect, userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customSubject, setCustomSubject] = useState("");
    const { theme } = useTheme();

    const handleSubjectSelect = (subject) => {
        if (subject === "Other") {
            setShowCustomInput(true);
        } else {
            onSelect(subject, false);
            setIsOpen(false);
            setShowCustomInput(false);
        }
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (customSubject.trim()) {
            onSelect(customSubject.trim(), false);
            setCustomSubject("");
            setShowCustomInput(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition ${theme === "dark"
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
            >
                <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Subject
                </span>
                <ChevronDown
                    className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`absolute top-full left-0 mt-2 w-full z-20 rounded-xl shadow-lg border ${theme === "dark"
                                ? "bg-slate-800 border-slate-700"
                                : "bg-white border-gray-200"
                                }`}
                        >
                            {!showCustomInput ? (
                                <div className="p-2 max-h-64 overflow-y-auto">
                                    {CS_SUBJECTS.map((subject) => (
                                        <button
                                            key={subject}
                                            onClick={() => handleSubjectSelect(subject)}
                                            className={`w-full text-left px-4 py-2 rounded-lg transition ${theme === "dark"
                                                ? "text-gray-300 hover:bg-slate-700"
                                                : "text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleSubjectSelect("Other")}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition ${theme === "dark"
                                            ? "text-indigo-400 hover:bg-slate-700"
                                            : "text-indigo-600 hover:bg-gray-100"
                                            } font-semibold`}
                                    >
                                        Other...
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCustomSubmit} className="p-4">
                                    <input
                                        type="text"
                                        value={customSubject}
                                        onChange={(e) => setCustomSubject(e.target.value)}
                                        placeholder="Enter custom subject name"
                                        autoFocus
                                        className={`w-full px-3 py-2 rounded-lg border ${theme === "dark"
                                            ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                                            : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${theme === "dark"
                                                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                }`}
                                        >
                                            Add
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={() => {
                                                setShowCustomInput(false);
                                                setCustomSubject("");
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`px-4 py-2 rounded-lg font-semibold transition ${theme === "dark"
                                                ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                }`}
                                        >
                                            Cancel
                                        </motion.button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

