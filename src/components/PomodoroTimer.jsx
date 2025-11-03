// Enhanced Pomodoro Timer with Minutes/Seconds Input
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { addSession } from "../services/firestoreService";
import { useToast } from "./ToastContainer";

export default function PomodoroTimer({ selectedSubject, onSessionComplete, hideSubjectLabel, onHideSubject }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const { showToast } = useToast();
    const [customMinutes, setCustomMinutes] = useState(25);
    const [customSeconds, setCustomSeconds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [initialDuration, setInitialDuration] = useState(25 * 60);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setHasCompleted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    useEffect(() => {
        if (hasCompleted && initialDuration > 0) {
            handleSessionComplete(initialDuration);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasCompleted]);

    const handleSessionComplete = async (durationInSeconds) => {
        if (user && durationInSeconds > 0) {
            try {
                const durationMinutes = Math.round(durationInSeconds / 60);
                const durationSeconds = durationInSeconds % 60;
                const dateISO = new Date().toISOString().split("T")[0];

                await addSession(user.uid, {
                    durationMinutes,
                    durationSeconds,
                    dateISO,
                    subject: selectedSubject || "General",
                    completed: true,
                });

                showToast(
                    `Focus session completed! ${durationMinutes}m ${durationSeconds > 0 ? durationSeconds + "s" : ""}`,
                    "success"
                );

                // Notify parent component to refresh stats
                if (onSessionComplete) {
                    onSessionComplete();
                }
            } catch (error) {
                console.error("Error logging session:", error);
                showToast("Failed to log session. Will retry when online.", "error");
            }
        }
    };

    const handleStart = () => {
        setIsRunning(true);
        setIsPaused(false);
        setHasCompleted(false);
    };

    const handlePause = () => {
        setIsRunning(false);
        setIsPaused(true);
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsPaused(false);
        const newDuration = customMinutes * 60 + customSeconds;
        setTimeLeft(newDuration);
        setInitialDuration(newDuration);
        setHasCompleted(false);
    };

    const handleSetCustom = () => {
        const newDuration = customMinutes * 60 + customSeconds;
        if (newDuration <= 0) {
            showToast("Duration must be greater than 0", "error");
            return;
        }
        setTimeLeft(newDuration);
        setInitialDuration(newDuration);
        setIsRunning(false);
        setIsPaused(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = initialDuration > 0 ? ((initialDuration - timeLeft) / initialDuration) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border backdrop-blur-xl ${theme === "dark"
                    ? "bg-slate-900/70 border-slate-800"
                    : "bg-white/80 border-gray-200"
                }`}
        >
            <div className="flex items-center gap-2 mb-4">
                <Clock className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    Focus Timer
                </h3>
            </div>

            {/* Subject Selection Display */}
            {selectedSubject && !hideSubjectLabel && (
                <div className={`mb-4 text-sm p-2 rounded-lg flex items-center justify-between ${theme === "dark"
                        ? "bg-indigo-500/20 text-gray-400 border border-indigo-500/30"
                        : "bg-indigo-50 text-gray-600 border border-indigo-200"
                    }`}>
                    <span>
                        Focusing on: <span className={`font-medium ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>{selectedSubject}</span>
                    </span>
                    {onHideSubject && (
                        <button
                            onClick={onHideSubject}
                            className={`p-1 rounded hover:opacity-70 transition ${theme === "dark" ? "hover:bg-indigo-500/20" : "hover:bg-indigo-100"
                                }`}
                            aria-label="Hide subject label"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            )}

            {/* Timer Display */}
            <div className="relative w-full max-w-64 h-64 mx-auto mb-6">
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className={theme === "dark" ? "text-slate-700" : "text-gray-300"}
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className={theme === "dark" ? "text-indigo-500" : "text-indigo-600"}
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`text-5xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center mb-4">
                {!isRunning && !isPaused ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleStart}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition ${theme === "dark"
                                ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                    >
                        <Play className="w-5 h-5" />
                        Start
                    </motion.button>
                ) : (
                    <>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={isRunning ? handlePause : handleStart}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition ${theme === "dark"
                                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                        >
                            {isRunning ? (
                                <>
                                    <Pause className="w-5 h-5" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Resume
                                </>
                            )}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleReset}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition ${theme === "dark"
                                    ? "bg-slate-700 text-white hover:bg-slate-600"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </motion.button>
                    </>
                )}
            </div>

            {/* Custom Duration */}
            <div className={`border-t pt-4 mt-4 ${theme === "dark" ? "border-slate-800" : "border-gray-200"
                }`}>
                <label className={`block text-sm mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Custom Duration
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className={`block text-xs mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                            Minutes
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="120"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                            className={`w-full bg-black border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 ${theme === "dark"
                                    ? "bg-slate-800 border-slate-700 text-white"
                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                }`}
                            disabled={isRunning}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs mb-1 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                            Seconds
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={customSeconds}
                            onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${theme === "dark"
                                    ? "bg-slate-800 border-slate-700 text-white"
                                    : "bg-gray-50 border-gray-300 text-gray-900"
                                }`}
                            disabled={isRunning}
                        />
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSetCustom}
                    disabled={isRunning}
                    className={`w-full py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${theme === "dark"
                            ? "bg-slate-700 text-white hover:bg-slate-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Set Duration
                </motion.button>
            </div>

            {/* Completion Message */}
            <AnimatePresence>
                {hasCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="mt-5 p-4 rounded-xl border backdrop-blur-xl 
                 bg-gradient-to-r from-green-500/15 to-emerald-500/15
                 border-green-500/30 text-center shadow-sm"
                    >
                        <p className="text-green-400 font-semibold text-lg flex items-center justify-center gap-2">
                            🎯 Focus session completed — Great job staying consistent!
                        </p>
                        <p className="text-green-300 text-sm mt-1">
                            Take a short break and come back stronger 💪
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}
