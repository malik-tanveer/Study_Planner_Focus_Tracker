// Subject Card Component
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Trash2, Edit2, X, Check } from "lucide-react";
import TaskCard from "./TaskCard";
import {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
} from "../services/firestoreService";

export default function SubjectCard({
    subject,
    onDeleteSubject,
    userId,
    onSelectSubject,
    onTaskChange,
}) {
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDeadline, setNewTaskDeadline] = useState("");
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

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            await addTask(userId, subject.id, {
                title: newTaskTitle,
                deadline: newTaskDeadline || null,
                status: "pending",
            });
            setNewTaskTitle("");
            setNewTaskDeadline("");
            setShowAddTask(false);
            loadTasks();
            if (onTaskChange) onTaskChange();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleToggleTaskStatus = async (taskId, currentStatus) => {
        try {
            await updateTask(userId, subject.id, taskId, {
                status: currentStatus === "pending" ? "completed" : "pending",
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

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
        >
            {/* Subject Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                        <p className="text-xs text-gray-400">
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
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
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
                    <p className="text-gray-500 text-sm">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
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
            <AnimatePresence>
                {!showAddTask ? (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddTask(true)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 py-2 rounded-lg hover:bg-indigo-500/30 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Task
                    </motion.button>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleAddTask}
                        className="space-y-3 border-t border-slate-800 pt-4"
                    >
                        <input
                            type="text"
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            autoFocus
                        />
                        <input
                            type="date"
                            placeholder="Deadline"
                            value={newTaskDeadline}
                            onChange={(e) => setNewTaskDeadline(e.target.value)}
                            className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <div className="flex gap-2">
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-indigo-500 text-white py-2 rounded-lg font-semibold hover:bg-indigo-600 transition"
                            >
                                Add
                            </motion.button>
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setShowAddTask(false);
                                    setNewTaskTitle("");
                                    setNewTaskDeadline("");
                                }}
                                className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-semibold hover:bg-slate-600 transition"
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

