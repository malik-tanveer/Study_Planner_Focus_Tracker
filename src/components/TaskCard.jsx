// Task Card Component
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Trash2, Calendar } from "lucide-react";

export default function TaskCard({ task, onToggleStatus, onDelete }) {
    const isCompleted = task.status === "completed";
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && !isCompleted && deadlineDate < new Date();

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`p-3 rounded-lg border ${isCompleted
                ? "bg-slate-800/50 border-green-500/30"
                : isOverdue
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-slate-800/30 border-slate-700"
                }`}
        >
            <div className="flex items-start gap-3">
                <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleStatus(task.id, task.status)}
                    className="mt-0.5 flex-shrink-0"
                >
                    {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-indigo-400" />
                    )}
                </motion.button>

                <div className="flex-1 min-w-0">
                    <p
                        className={`text-sm ${isCompleted
                            ? "text-gray-400 line-through"
                            : "text-white"
                            }`}
                    >
                        {task.title}
                    </p>
                    {deadlineDate && (
                        <div className="flex items-center gap-1 mt-1">
                            <Calendar className={`w-3 h-3 ${isOverdue ? "text-red-400" : "text-gray-500"
                                }`} />
                            <span
                                className={`text-xs ${isOverdue
                                    ? "text-red-400 font-semibold"
                                    : "text-gray-500"
                                    }`}
                            >
                                {deadlineDate.toLocaleDateString()}
                                {isOverdue && " (Overdue)"}
                            </span>
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(task.id)}
                    className="flex-shrink-0 text-red-400 hover:text-red-300 transition"
                >
                    <Trash2 className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
}

