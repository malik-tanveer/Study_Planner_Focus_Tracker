// Enhanced Task Form with Validation
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function TaskForm({ onClose, onSubmit, userId, subjectId }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const { theme } = useTheme();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        // Convert deadline and time to ISO strings
        const deadlineISO = deadline ? new Date(deadline).toISOString() : null;
        let timeISO = null;
        if (time) {
            const [hours, minutes] = time.split(":");
            const timeDate = new Date();
            timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            timeISO = timeDate.toISOString();
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            deadlineISO,
            timeISO,
        });

        // Reset form
        setTitle("");
        setDescription("");
        setDeadline("");
        setTime("");
        setError("");
        onClose();
    };

    const handleClose = () => {
        if (!title.trim()) {
            onClose();
        } else if (window.confirm("Are you sure you want to close? Changes will be lost.")) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md rounded-2xl border p-6 ${theme === "dark"
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-gray-200"
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>
                        Add New Task
                    </h3>
                    <button
                        onClick={handleClose}
                        className={`p-1 rounded-lg transition ${theme === "dark"
                            ? "hover:bg-slate-800 text-gray-400"
                            : "hover:bg-gray-100 text-gray-600"
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setError("");
                            }}
                            className={`w-full px-3 py-2 rounded-lg border ${theme === "dark"
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-gray-50 border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error ? "border-red-500" : ""
                                }`}
                            placeholder="Enter task title"
                            autoFocus
                            required
                        />
                        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                            Description <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setError("");
                            }}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border ${theme === "dark"
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-gray-50 border-gray-300 text-gray-900"
                                } focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error && !description.trim() ? "border-red-500" : ""}`}
                            placeholder="Enter task description"
                            required
                        />
                    </div>

                    {/* Deadline and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => {
                                    setDeadline(e.target.value);
                                    setError("");
                                }}
                                className={`w-full px-3 py-2 rounded-lg border ${theme === "dark"
                                    ? "bg-slate-800 border-slate-700 text-white"
                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                    } focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error && !deadline ? "border-red-500" : ""}`}
                                required
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                                }`}>
                                <Clock className="w-4 h-4 inline mr-1" />
                                Time <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => {
                                    setTime(e.target.value);
                                    setError("");
                                }}
                                className={`w-full px-3 py-2 rounded-lg border ${theme === "dark"
                                    ? "bg-slate-800 border-slate-700 text-white"
                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                    } focus:outline-none focus:ring-2 focus:ring-indigo-400 ${error && !time ? "border-red-500" : ""}`}
                                required
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <motion.button
                            type="button"
                            onClick={handleClose}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${theme === "dark"
                                ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${theme === "dark"
                                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            Save Task
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

