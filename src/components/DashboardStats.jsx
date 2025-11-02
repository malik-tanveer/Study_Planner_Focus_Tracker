// Dashboard Stats Component
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Target, TrendingUp } from "lucide-react";
import { getSessions } from "../services/firestoreService";
import { getSubjects } from "../services/firestoreService";
import { getTasks } from "../services/firestoreService";

export default function DashboardStats({ userId, refreshKey }) {
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalHours: 0,
        totalTasks: 0,
        completedTasks: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, refreshKey]);

    // Less aggressive refresh - only every 60 seconds for background updates
    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => {
                loadStats();
            }, 60000); // 60 seconds instead of 5 - much less aggressive
            return () => clearInterval(interval);
        }
    }, [userId]);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Load sessions
            const sessions = await getSessions(userId);
            const totalHours = sessions.reduce(
                (sum, session) => sum + (session.duration || 0),
                0
            ) / 3600; // Convert to hours

            // Load all subjects and tasks
            const subjects = await getSubjects(userId);
            let allTasks = [];
            for (const subject of subjects) {
                const tasks = await getTasks(userId, subject.id);
                allTasks.push(...tasks);
            }

            const completedTasks = allTasks.filter((t) => t.status === "completed").length;

            setStats({
                totalSessions: sessions.length,
                totalHours: totalHours.toFixed(1),
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
            label: "Total Sessions",
            value: stats.totalSessions,
            iconBg: "bg-indigo-500/20",
            iconBorder: "border-indigo-500/30",
            iconColor: "text-indigo-400",
        },
        {
            icon: TrendingUp,
            label: "Focus Hours",
            value: `${stats.totalHours}h`,
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

