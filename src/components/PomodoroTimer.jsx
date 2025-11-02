// Pomodoro Timer Component
import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { addSession } from "../services/firestoreService";

export default function PomodoroTimer({ selectedSubject, onSessionComplete }) {
    const { user } = useAuth();
    const [customMinutes, setCustomMinutes] = useState(25);
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

    const handleSessionComplete = async (duration) => {
        if (user && duration > 0) {
            try {
                await addSession(user.uid, {
                    duration: duration, // in seconds
                    date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
                    subject: selectedSubject || "General",
                    completed: true,
                    timestamp: new Date().toISOString(),
                });
                // Notify parent component to refresh stats
                if (onSessionComplete) {
                    onSessionComplete();
                }
            } catch (error) {
                console.error("Error logging session:", error);
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
        const newDuration = customMinutes * 60;
        setTimeLeft(newDuration);
        setInitialDuration(newDuration);
        setHasCompleted(false);
    };

    const handleSetCustom = () => {
        const newDuration = customMinutes * 60;
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
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
        >
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-semibold text-white">Focus Timer</h3>
            </div>

            {/* Subject Selection Display */}
            {selectedSubject && (
                <div className="mb-4 text-sm text-gray-400">
                    Focusing on: <span className="text-indigo-400 font-medium">{selectedSubject}</span>
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
                        className="text-slate-700"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-indigo-500"
                        strokeDasharray={`${2 * Math.PI * 120}`}
                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl font-bold text-white transition-opacity duration-300">
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
                        className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-600 transition"
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
                            className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-600 transition"
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
                            className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-600 transition"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Reset
                        </motion.button>
                    </>
                )}
            </div>

            {/* Custom Duration */}
            <div className="border-t border-slate-800 pt-4 mt-4">
                <label className="block text-sm text-gray-400 mb-2">Custom Duration (minutes)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="1"
                        max="60"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Number(e.target.value))}
                        className="flex-1 bg-black border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        disabled={isRunning}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSetCustom}
                        disabled={isRunning}
                        className="bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Set
                    </motion.button>
                </div>
            </div>

            {/* Completion Message */}
            <AnimatePresence>
                {hasCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center"
                    >
                        <p className="text-green-400 font-semibold">🎉 Focus session completed!</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}