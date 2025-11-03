// Analytics Component with Multiple Interactive Charts
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Bar, Line, Pie, Radar } from "react-chartjs-2";
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
import { useTheme } from "../context/ThemeContext";
import { getSessions } from "../services/firestoreService";
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

    const { theme } = useTheme();
    const [focusHoursData, setFocusHoursData] = useState({ labels: [], data: [] });
    const [subjectPerformance, setSubjectPerformance] = useState([]);
    const [timeRange, setTimeRange] = useState("day"); // day, month
    const [chartType, setChartType] = useState("bar"); // bar, line, pie, radar
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadAnalyticsData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, timeRange, refreshKey]);

    // Less aggressive refresh - only every 60 seconds
    useEffect(() => {
        if (userId) {
            const interval = setInterval(() => {
                loadAnalyticsData();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [userId, timeRange]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);

            // Load sessions
            const sessions = await getSessions(userId);

            // Load all subjects
            const subjects = await getSubjects(userId);

            // Calculate subject-wise performance
            const subjectData = {};
            subjects.forEach((subject) => {
                subjectData[subject.name] = {
                    hours: 0,
                    sessions: 0,
                };
            });

            // Aggregate session data by subject - use durationMinutes and durationSeconds
            sessions.forEach((session) => {
                if (session.subject && subjectData[session.subject]) {
                    const minutes = session.durationMinutes || 0;
                    const seconds = session.durationSeconds || 0;
                    const totalHours = (minutes + seconds / 60) / 60;
                    subjectData[session.subject].hours += totalHours;
                    subjectData[session.subject].sessions += 1;
                }
            });

            const subjectPerf = Object.keys(subjectData).map((subjectName) => ({
                subject: subjectName,
                ...subjectData[subjectName],
            }));

            setSubjectPerformance(subjectPerf);

            // Process focus hours data based on time range (day or month)
            const now = new Date();
            const days = timeRange === "day" ? 7 : 30; // Show last 7 days or 30 days
            const dateMap = {};

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];
                dateMap[dateStr] = 0;
            }

            sessions.forEach((session) => {
                if (session.dateISO) {
                    const sessionDate = session.dateISO;
                    if (dateMap.hasOwnProperty(sessionDate)) {
                        const minutes = session.durationMinutes || 0;
                        const seconds = session.durationSeconds || 0;
                        const totalHours = (minutes + seconds / 60) / 60;
                        dateMap[sessionDate] += totalHours;
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
        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Focus Hours Chart Data
    const focusChartData = {
        labels: focusHoursData.labels || [],
        datasets: [
            {
                label: "Focus Hours",
                data: focusHoursData.data || [],
                backgroundColor:
                    chartType === "radar"
                        ? "rgba(99, 102, 241, 0.2)"
                        : chartType === "pie"
                            ? [
                                "rgba(99, 102, 241, 0.8)",
                                "rgba(139, 92, 246, 0.8)",
                                "rgba(59, 130, 246, 0.8)",
                                "rgba(16, 185, 129, 0.8)",
                                "rgba(236, 72, 153, 0.8)",
                                "rgba(251, 191, 36, 0.8)",
                            ].slice(0, focusHoursData.data?.length || 0)
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

    // Subject Performance Chart Data
    const subjectChartData = {
        labels: subjectPerformance.map((s) => s.subject),
        datasets: [
            {
                label: "Focus Hours",
                data: subjectPerformance.map((s) => s.hours),
                backgroundColor:
                    chartType === "radar"
                        ? "rgba(99, 102, 241, 0.2)"
                        : chartType === "pie"
                            ? [
                                "rgba(99, 102, 241, 0.8)",
                                "rgba(139, 92, 246, 0.8)",
                                "rgba(59, 130, 246, 0.8)",
                                "rgba(16, 185, 129, 0.8)",
                                "rgba(236, 72, 153, 0.8)",
                                "rgba(251, 191, 36, 0.8)",
                            ].slice(0, subjectPerformance.length)
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

    const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
    const gridColor = theme === "dark" ? "rgba(148, 163, 184, 0.1)" : "rgba(148, 163, 184, 0.2)";
    const bgColor = theme === "dark" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                },
            },
            tooltip: {
                backgroundColor: bgColor,
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: "rgba(99, 102, 241, 0.5)",
                borderWidth: 1,
            },
        },
        scales:
            chartType !== "radar" && chartType !== "pie"
                ? {
                    x: {
                        ticks: { color: textColor },
                        grid: { color: gridColor },
                    },
                    y: {
                        ticks: { color: textColor },
                        grid: { color: gridColor },
                        beginAtZero: true,
                    },
                }
                : chartType === "radar"
                    ? {
                        r: {
                            ticks: { color: textColor, backdropColor: "transparent" },
                            grid: { color: gridColor },
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
                    color: textColor,
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: bgColor,
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: "rgba(99, 102, 241, 0.5)",
                borderWidth: 1,
            },
        },
    };

    const renderFocusHoursChart = () => {
        if (focusHoursData.data && focusHoursData.data.length > 0) {
            if (chartType === "bar") {
                return <Bar data={focusChartData} options={chartOptions} />;
            } else if (chartType === "line") {
                return <Line data={focusChartData} options={chartOptions} />;
            } else if (chartType === "pie") {
                return <Pie data={focusChartData} options={pieOptions} />;
            } else if (chartType === "radar") {
                return <Radar data={focusChartData} options={chartOptions} />;
            }
        }
        return (
            <div className={`h-full flex items-center justify-center ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                No focus sessions yet
            </div>
        );
    };

    const renderSubjectPerformanceChart = () => {
        if (subjectPerformance.length > 0) {
            if (chartType === "bar") {
                return <Bar data={subjectChartData} options={chartOptions} />;
            } else if (chartType === "line") {
                return <Line data={subjectChartData} options={chartOptions} />;
            } else if (chartType === "pie") {
                return <Pie data={subjectChartData} options={pieOptions} />;
            } else if (chartType === "radar") {
                return <Radar data={subjectChartData} options={chartOptions} />;
            }
        }
        return (
            <div className={`h-full flex items-center justify-center ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}>
                No subject data yet
            </div>
        );
    };

    const chartTypeIcons = {
        bar: BarChart3,
        line: LineChart,
        pie: PieChart,
        radar: Activity,
    };

    return (
        <>
            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
                        <h3
                            className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Analytics
                        </h3>
                    </div>

                    {/* Dropdown Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Time Range Dropdown */}
                        <div className="relative">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={`appearance-none px-4 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-all
            ${theme === "dark"
                                        ? "bg-slate-800 border-slate-700 text-gray-200 focus:ring-indigo-500"
                                        : "bg-gray-100 border-gray-300 text-gray-700 focus:ring-indigo-600"
                                    }`}
                            >
                                <option value="day">Day</option>
                                <option value="month">Month</option>
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-2.5 w-4 h-4 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                    }`}
                            />
                        </div>

                        {/* Chart Type Dropdown */}
                        <div className="relative">
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className={`appearance-none px-4 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-all
            ${theme === "dark"
                                        ? "bg-slate-800 border-slate-700 text-gray-200 focus:ring-indigo-500"
                                        : "bg-gray-100 border-gray-300 text-gray-700 focus:ring-indigo-600"
                                    }`}
                            >
                                <option value="bar">Bar Chart</option>
                                <option value="line">Line Chart</option>
                                <option value="pie">Pie Chart</option>
                                <option value="radar">Radar Chart</option>
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-2.5 w-4 h-4 pointer-events-none ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                {loading ? (
                    <div
                        className={`text-center py-8 ${theme === "dark" ? "text-gray-500" : "text-gray-400"
                            }`}
                    >
                        Loading analytics...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Focus Hours Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={`focus-${chartType}-${timeRange}`}
                            className={`rounded-2xl p-6 backdrop-blur-xl border ${theme === "dark"
                                    ? "bg-slate-900/70 border-slate-800"
                                    : "bg-white/80 border-gray-200"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar
                                    className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                                        }`}
                                />
                                <h4
                                    className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    Focus Hours
                                </h4>
                            </div>
                            <div className="h-80">{renderFocusHoursChart()}</div>
                        </motion.div>

                        {/* Subject Performance Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            key={`subject-${chartType}`}
                            className={`rounded-2xl p-6 backdrop-blur-xl border ${theme === "dark"
                                    ? "bg-slate-900/70 border-slate-800"
                                    : "bg-white/80 border-gray-200"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Target
                                    className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"
                                        }`}
                                />
                                <h4
                                    className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"
                                        }`}
                                >
                                    Subject Performance
                                </h4>
                            </div>
                            <div className="h-80">{renderSubjectPerformanceChart()}</div>
                        </motion.div>
                    </div>
                )}
            </div>

        </>
    );
}
