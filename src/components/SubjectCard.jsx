// Subject Card Component
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
} from "../services/firestoreService";
import { useTheme } from "../context/ThemeContext";

export default function SubjectCard({
    subject,
    onDeleteSubject,
    userId,
    onSelectSubject,
    onTaskChange,
}) {
    const { theme } = useTheme();
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTasks();
    }, [subject.id]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const tasksData = await getTasks(userId, subject.id);
            setTasks(tasksData);
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (taskData) => {
        try {
            await addTask(userId, subject.id, {
                title: taskData.title,
                description: taskData.description,
                deadlineISO: taskData.deadlineISO,
                timeISO: taskData.timeISO,
            });
            setShowAddTask(false);
            loadTasks();
            if (onTaskChange) onTaskChange();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        try {
            // Handle both 'status' field (pending/completed) and 'completed' boolean
            const isCompleted = currentStatus === "completed" || currentStatus === true;
            await updateTask(userId, subject.id, taskId, {
                completed: !isCompleted,
                status: isCompleted ? "pending" : "completed",
            });
            loadTasks();
            if (onTaskChange) onTaskChange();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(userId, subject.id, taskId);
            loadTasks();
            if (onTaskChange) onTaskChange();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleSelectSubject = () => {
        if (onSelectSubject) {
            onSelectSubject(subject.name);
        }
    };

    const completedTasks = tasks.filter((t) => t.completed === true || t.status === "completed").length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <>
            {showAddTask && (
                <TaskForm
                    onClose={() => setShowAddTask(false)}
                    onSubmit={handleAddTask}
                    userId={userId}
                    subjectId={subject.id}
                />
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-6 backdrop-blur-xl border ${theme === "dark"
                    ? "bg-slate-900/70 border-slate-800"
                    : "bg-white/80 border-gray-200"
                    }`}
            >
                {/* Subject Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                            <BookOpen className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                                }`}>
                                {subject.name}
                            </h3>
                            {subject.description && (
                                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                                    }`}>
                                    {subject.description}
                                </p>
                            )}
                            <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"
                                }`}>
                                {completedTasks}/{totalTasks} tasks completed
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleSelectSubject}
                            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition"
                            title="Select for timer"
                        >
                            <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteSubject(subject.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Progress Bar */}
                {totalTasks > 0 && (
                    <div className="mb-4">
                        <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"
                            }`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {loading ? (
                        <p className={`text-sm ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                            }`}>
                            Loading tasks...
                        </p>
                    ) : tasks.length === 0 ? (
                        <p className={`text-sm text-center py-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                            }`}>
                            No tasks yet. Add one to get started!
                        </p>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggleStatus={handleToggleTaskStatus}
                                onDelete={handleDeleteTask}
                            />
                        ))
                    )}
                </div>

                {/* Add Task Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddTask(true)}
                    className={`w-full flex items-center justify-center gap-2 border py-2 rounded-lg transition ${theme === "dark"
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"
                        : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                        }`}
                >
                    <Plus className="w-4 h-4" />
                    Add Task
                </motion.button>
            </motion.div>
        </>
    );
}

