// Analytics Component with Multiple Interactive Charts
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Line, Pie, Doughnut, Radar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { TrendingUp, Calendar, Target, BarChart3, LineChart, PieChart, Activity } from "lucide-react";
import { getSessions, getTasks } from "../services/firestoreService";
import { getSubjects } from "../services/firestoreService";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Analytics({ userId, refreshKey }) {
    const [focusHoursData, setFocusHoursData] = useState([]);
    const [taskStats, setTaskStats] = useState({ completed: 0, pending: 0 });
    const [subjectPerformance, setSubjectPerformance] = useState([]);
    const [timeRange, setTimeRange] = useState("week");
    const [viewMode, setViewMode] = useState("weekly"); // weekly, daily, subject
    const [chartType, setChartType] = useState("bar"); // bar, line, pie, radar
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadAnalyticsData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, timeRange, viewMode, refreshKey]);

    // Less aggressive refresh - only every 60 seconds
    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => {
                loadAnalyticsData();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [userId, timeRange, viewMode]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);

            // Load sessions
            const sessions = await getSessions(userId);

            // Load all subjects and their tasks
            const subjects = await getSubjects(userId);
            let allTasks = [];
            for (const subject of subjects) {
                const tasks = await getTasks(userId, subject.id);
                allTasks.push(...tasks);
            }

            // Calculate task stats
            const completed = allTasks.filter((t) => t.status === "completed").length;
            const pending = allTasks.filter((t) => t.status === "pending").length;
            setTaskStats({ completed, pending });

            // Calculate subject-wise performance
            const subjectData = {};
            subjects.forEach((subject) => {
                subjectData[subject.name] = {
                    hours: 0,
                    sessions: 0,
                    tasks: 0,
                    completedTasks: 0,
                };
            });

            // Aggregate session data by subject
            sessions.forEach((session) => {
                if (session.subject && subjectData[session.subject]) {
                    subjectData[session.subject].hours += (session.duration || 0) / 3600;
                    subjectData[session.subject].sessions += 1;
                }
            });

            // Aggregate task data by subject
            for (const subject of subjects) {
                const tasks = await getTasks(userId, subject.id);
                subjectData[subject.name].tasks = tasks.length;
                subjectData[subject.name].completedTasks = tasks.filter(
                    (t) => t.status === "completed"
                ).length;
            }

            const subjectPerf = Object.keys(subjectData).map((subjectName) => ({
                subject: subjectName,
                ...subjectData[subjectName],
            }));

            setSubjectPerformance(subjectPerf);

            // Process focus hours data based on view mode
            if (viewMode === "subject") {
                // For subject view, we already have the data
                setFocusHoursData({
                    labels: subjectPerf.map((s) => s.subject),
                    data: subjectPerf.map((s) => s.hours),
                });
            } else if (viewMode === "daily") {
                // Daily view - show last 7 days by default
                const now = new Date();
                const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
                const dateMap = {};
                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split("T")[0];
                    dateMap[dateStr] = 0;
                }

                sessions.forEach((session) => {
                    if (session.date && session.duration) {
                        const sessionDate = session.date;
                        if (dateMap.hasOwnProperty(sessionDate)) {
                            dateMap[sessionDate] += session.duration / 3600;
                        }
                    }
                });

                const labels = Object.keys(dateMap);
                const data = Object.values(dateMap);

                const formattedLabels = labels.map((label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                });

                setFocusHoursData({ labels: formattedLabels, data });
            } else {
                // Weekly view - group by week
                const now = new Date();
                let days = 7;
                if (timeRange === "month") days = 30;
                if (timeRange === "year") days = 365;

                const weekMap = {};
                for (let i = days - 1; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split("T")[0];
                    if (!weekMap[weekKey]) {
                        weekMap[weekKey] = {
                            label: `Week ${Math.ceil(date.getDate() / 7)}`,
                            hours: 0,
                        };
                    }
                    const sessionDate = date.toISOString().split("T")[0];
                    sessions.forEach((session) => {
                        if (session.date === sessionDate && session.duration) {
                            weekMap[weekKey].hours += session.duration / 3600;
                        }
                    });
                }

                const labels = Object.values(weekMap).map((w) => w.label);
                const data = Object.values(weekMap).map((w) => w.hours);

                setFocusHoursData({ labels, data });
            }
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Focus Hours Chart Data (Bar/Line/Radar)
    const focusChartData = {
        labels: focusHoursData.labels || [],
        datasets: [
            {
                label: viewMode === "subject" ? "Hours by Subject" : "Focus Hours",
                data: focusHoursData.data || [],
                backgroundColor:
                    chartType === "radar"
                        ? "rgba(99, 102, 241, 0.2)"
                        : "rgba(99, 102, 241, 0.8)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 2,
                borderRadius: chartType === "bar" ? 8 : 0,
                pointRadius: chartType === "line" || chartType === "radar" ? 4 : undefined,
                pointBackgroundColor: chartType === "line" ? "rgba(99, 102, 241, 1)" : undefined,
                fill: chartType === "line" || chartType === "radar" ? true : false,
            },
        ],
    };

    // Task Chart Data (Pie/Doughnut)
    const taskChartData = {
        labels: ["Completed", "Pending"],
        datasets: [
            {
                data: [taskStats.completed, taskStats.pending],
                backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(148, 163, 184, 0.8)"],
                borderColor: ["rgba(34, 197, 94, 1)", "rgba(148, 163, 184, 1)"],
                borderWidth: 2,
            },
        ],
    };

    // Subject Performance Radar Chart Data
    const subjectRadarData = {
        labels: subjectPerformance.map((s) => s.subject),
        datasets: [
            {
                label: "Hours",
                data: subjectPerformance.map((s) => s.hours),
                backgroundColor: "rgba(99, 102, 241, 0.2)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 2,
            },
            {
                label: "Sessions",
                data: subjectPerformance.map((s) => s.sessions),
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
            },
            {
                label: "Completed Tasks",
                data: subjectPerformance.map((s) => s.completedTasks),
                backgroundColor: "rgba(236, 72, 153, 0.2)",
                borderColor: "rgba(236, 72, 153, 1)",
                borderWidth: 2,
            },
        ],
    };

    // Subject Performance Bar/Line Chart Data
    const subjectChartData = {
        labels: subjectPerformance.map((s) => s.subject),
        datasets: [
            {
                label: "Focus Hours",
                data: subjectPerformance.map((s) => s.hours),
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 2,
                borderRadius: chartType === "bar" ? 8 : 0,
            },
            {
                label: "Sessions",
                data: subjectPerformance.map((s) => s.sessions),
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
                borderRadius: chartType === "bar" ? 8 : 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#e2e8f0",
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleColor: "#e2e8f0",
                bodyColor: "#e2e8f0",
                borderColor: "rgba(99, 102, 241, 0.5)",
                borderWidth: 1,
            },
        },
        scales:
            chartType !== "radar" && focusHoursData.labels
                ? {
                    x: {
                        ticks: { color: "#94a3b8" },
                        grid: { color: "rgba(148, 163, 184, 0.1)" },
                    },
                    y: {
                        ticks: { color: "#94a3b8" },
                        grid: { color: "rgba(148, 163, 184, 0.1)" },
                        beginAtZero: true,
                    },
                }
                : chartType === "radar"
                    ? {
                        r: {
                            ticks: { color: "#94a3b8", backdropColor: "transparent" },
                            grid: { color: "rgba(148, 163, 184, 0.1)" },
                            beginAtZero: true,
                        },
                    }
                    : {},
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#e2e8f0",
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                titleColor: "#e2e8f0",
                bodyColor: "#e2e8f0",
                borderColor: "rgba(99, 102, 241, 0.5)",
                borderWidth: 1,
            },
        },
    };

    const renderChart = () => {
        if (viewMode === "subject" && chartType === "radar") {
            // Subject-wise Radar Chart
            return subjectPerformance.length > 0 ? (
                <Radar data={subjectRadarData} options={chartOptions} />
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    No subject data yet
                </div>
            );
        } else if (viewMode === "subject") {
            // Subject-wise Bar/Line Chart
            return subjectPerformance.length > 0 ? (
                chartType === "bar" ? (
                    <Bar data={subjectChartData} options={chartOptions} />
                ) : (
                    <Line data={subjectChartData} options={chartOptions} />
                )
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    No subject data yet
                </div>
            );
        } else if (chartType === "pie" || chartType === "radar") {
            // Pie chart for tasks (when view is not subject)
            return taskStats.completed + taskStats.pending > 0 ? (
                chartType === "pie" ? (
                    <Pie data={taskChartData} options={pieOptions} />
                ) : (
                    <Radar
                        data={{
                            labels: ["Focus Hours", "Completed Tasks", "Total Sessions"],
                            datasets: [
                                {
                                    label: "Performance",
                                    data: [
                                        focusHoursData.data?.reduce((a, b) => a + b, 0) || 0,
                                        taskStats.completed,
                                        focusHoursData.data?.length || 0,
                                    ],
                                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                                    borderColor: "rgba(99, 102, 241, 1)",
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={chartOptions}
                    />
                )
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    No data yet
                </div>
            );
        } else {
            // Bar or Line chart for focus hours
            return focusHoursData.data && focusHoursData.data.length > 0 ? (
                chartType === "bar" ? (
                    <Bar data={focusChartData} options={chartOptions} />
                ) : (
                    <Line data={focusChartData} options={chartOptions} />
                )
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                    No focus sessions yet
                </div>
            );
        }
    };

    const chartTypeIcons = {
        bar: BarChart3,
        line: LineChart,
        pie: PieChart,
        radar: Activity,
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-semibold text-white">Analytics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* View Mode Selector */}
                    <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
                        {["weekly", "daily", "subject"].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition ${viewMode === mode
                                    ? "bg-indigo-500 text-white"
                                    : "text-gray-400 hover:text-white hover:bg-slate-700"
                                    }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Chart Type Selector */}
                    <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
                        {["bar", "line", "pie", "radar"].map((type) => {
                            const Icon = chartTypeIcons[type];
                            return (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition flex items-center gap-1 ${chartType === type
                                        ? "bg-indigo-500 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-slate-700"
                                        }`}
                                    title={type.charAt(0).toUpperCase() + type.slice(1)}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Time Range Selector (only for weekly/daily views) */}
                    {viewMode !== "subject" && (
                        <div className="flex gap-2 bg-slate-800 rounded-lg p-1">
                            {["week", "month", "year"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${timeRange === range
                                        ? "bg-indigo-500 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-slate-700"
                                        }`}
                                >
                                    {range.charAt(0).toUpperCase() + range.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading analytics...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={`${chartType}-${viewMode}-${timeRange}`}
                        className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl lg:col-span-2"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            {viewMode === "subject" ? (
                                <Target className="w-5 h-5 text-indigo-400" />
                            ) : (
                                <Calendar className="w-5 h-5 text-indigo-400" />
                            )}
                            <h4 className="text-lg font-semibold text-white">
                                {viewMode === "subject"
                                    ? "Subject Performance"
                                    : viewMode === "daily"
                                        ? "Daily Focus Hours"
                                        : "Weekly Focus Hours"}
                            </h4>
                        </div>
                        <div className="h-80">
                            {renderChart()}
                        </div>
                    </motion.div>

                    {/* Tasks Overview Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-lg font-semibold text-white">Tasks Overview</h4>
                        </div>
                        <div className="h-64">
                            {taskStats.completed + taskStats.pending > 0 ? (
                                <Doughnut data={taskChartData} options={pieOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    No tasks yet
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Subject Summary */}
                    {subjectPerformance.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-5 h-5 text-indigo-400" />
                                <h4 className="text-lg font-semibold text-white">Subject Summary</h4>
                            </div>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {subjectPerformance.map((subject, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-white text-sm">
                                                {subject.subject}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {subject.hours.toFixed(1)}h
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-gray-400">
                                            <span>{subject.sessions} sessions</span>
                                            <span>
                                                {subject.completedTasks}/{subject.tasks} tasks
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
