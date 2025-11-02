// Motivational Quote Component
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const quotes = [
    "Discipline beats motivation",
    "Every session counts",
    "Progress, not perfection",
    "Focus is a superpower",
    "Small steps lead to big results",
    "You are capable of amazing things",
    "Consistency creates change",
    "Your future self will thank you",
    "Stay focused, stay winning",
    "Greatness is built one session at a time",
];

export default function MotivationalQuote() {
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        // Change quote every 10 seconds
        const interval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-4"
        >
            <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentQuote}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-white font-medium text-sm"
                    >
                        {quotes[currentQuote]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

