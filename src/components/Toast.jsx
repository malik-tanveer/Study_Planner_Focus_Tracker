// Toast Notification Component
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -20, x: "-50%" }}
                className="fixed top-4 left-1/2 z-50 transform -translate-x-1/2"
            >
                <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-xl border ${type === "success"
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : "bg-red-500/20 border-red-500/30 text-red-400"
                        }`}
                >
                    {type === "success" && <CheckCircle2 className="w-5 h-5" />}
                    <span className="font-medium">{message}</span>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="ml-2 hover:opacity-70 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

