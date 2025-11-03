// Dashboard Stats Component - Updated
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Target, TrendingUp } from "lucide-react";
import { getSubjects } from "../services/firestoreService";
import { getTasks } from "../services/firestoreService";
import { useTheme } from "../context/ThemeContext";

export default function DashboardStats({ userId, refreshKey }) {
    const [stats, setStats] = useState({
        totalSubjects: 0,
        totalFocusMinutes: 0,
        totalTasks: 0,
        completedTasks: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) loadStats();
    }, [userId, refreshKey]);

    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => loadStats(), 60000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const loadStats = async () => {
        try {
            setLoading(true);
            const subjects = await getSubjects(userId);
            let allTasks = [];
            let totalMinutes = 0;

            for (const subject of subjects) {
                const tasks = await getTasks(userId, subject.id);
                allTasks.push(...tasks);
                totalMinutes += tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
            }

            const completedTasks = allTasks.filter((t) => t.status === "completed").length;

            setStats({
                totalSubjects: subjects.length,
                totalFocusMinutes: totalMinutes,
                totalTasks: allTasks.length,
                completedTasks,
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: Clock,
            label: "Total Subjects",
            value: stats.totalSubjects,
            iconBg: "bg-indigo-500/20",
            iconBorder: "border-indigo-500/30",
            iconColor: "text-indigo-400",
        },
        {
            icon: TrendingUp,
            label: "Focus Minutes",
            value: `${stats.totalFocusMinutes} min`,
            iconBg: "bg-green-500/20",
            iconBorder: "border-green-500/30",
            iconColor: "text-green-400",
        },
        {
            icon: Target,
            label: "Completed Tasks",
            value: `${stats.completedTasks}/${stats.totalTasks}`,
            iconBg: "bg-purple-500/20",
            iconBorder: "border-purple-500/30",
            iconColor: "text-purple-400",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 animate-pulse"
                    >
                        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-slate-700 rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-lg ${stat.iconBg} flex items-center justify-center border ${stat.iconBorder}`}
                        >
                            <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
