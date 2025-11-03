// Unified Dashboard Page - All sections on one page
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { addSubject, getSubjects, deleteSubject, getTasks } from "../services/firestoreService";
import SubjectCard from "../components/SubjectCard";
import PomodoroTimer from "../components/PomodoroTimer";
import DashboardStats from "../components/DashboardStats";
import Analytics from "../components/Analytics";
import MotivationalQuote from "../components/MotivationalQuote";
import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing re-renders

  useEffect(() => {
    if (user) {
      loadSubjects();
    }
  }, [user]);

  // Removed aggressive auto-refresh - components will refresh on their own intervals

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await getSubjects(user.uid);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !newSubjectDescription.trim()) {
      return;
    }

    try {
      await addSubject(user.uid, newSubjectName, false, newSubjectDescription);
      setNewSubjectName("");
      setNewSubjectDescription("");
      setShowAddSubject(false);
      loadSubjects();
      setRefreshKey((prev) => prev + 1); // Trigger stats refresh
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject and all its tasks?")) {
      return;
    }

    try {
      await deleteSubject(user.uid, subjectId);
      loadSubjects();
      setRefreshKey((prev) => prev + 1); // Trigger stats refresh
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [subjectCompletionStatus, setSubjectCompletionStatus] = useState({});
  // Check subject completion status
  useEffect(() => {
    const checkSubjectCompletion = async () => {
      if (!user || !subjects?.length) return;

      const statusMap = {};
      for (const subject of subjects) {
        try {
          const tasks = (await getTasks(user.uid, subject.id)) || []; // Ensure tasks is always an array
          const totalTasks = tasks.length;
          const completedTasks = tasks.filter((t) => t?.completed || t?.status === "completed").length;

          statusMap[subject.id] = {
            isCompleted: totalTasks > 0 && completedTasks === totalTasks,
            totalTasks,
            completedTasks,
          };
        } catch (error) {
          console.error(`Error checking completion for subject ${subject.id}:`, error);
          statusMap[subject.id] = { isCompleted: false, totalTasks: 0, completedTasks: 0 };
        }
      }
      setSubjectCompletionStatus(statusMap);
    };

    checkSubjectCompletion();
  }, [subjects, user, refreshKey]);

  // Separate completed and active subjects safely
  const activeSubjects = (subjects || []).filter((subject) => {
    const status = subjectCompletionStatus[subject.id];
    return !status || !status.isCompleted;
  });

  const completedSubjects = (subjects || []).filter((subject) => {
    const status = subjectCompletionStatus[subject.id];
    return status && status.isCompleted;
  });

  // Session complete handler
  const handleSessionComplete = () => {
    setRefreshKey((prev) => prev + 1);
    loadSubjects();
  };
  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark"
      ? "bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white"
      : "bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900"
      }`}>
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 w-full max-w-xl mx-auto"
        >
          <MotivationalQuote />
        </motion.div>


        {/* Dashboard Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <DashboardStats userId={user?.uid} refreshKey={refreshKey} />
        </motion.div>

        {/* Main Content Grid - Subjects & Timer Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Subjects & Tasks Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  Subjects & Tasks
                </h2>
              </div>

              {/* Add Subject Section */}
              <div className="mb-6">
                {!showAddSubject ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddSubject(true)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition shadow-lg ${theme === "dark"
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                  >
                    <Plus className="w-5 h-5" />
                    Add New Subject
                  </motion.button>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddSubject}
                    className={`rounded-xl p-4 backdrop-blur-xl border ${theme === "dark" ? "bg-slate-900/70 border-slate-800" : "bg-white/80 border-gray-200"
                      }`}
                  >
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Subject name * (e.g., Mathematics, History)"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        required
                        className={`w-full border rounded-lg px-4 py-2 ${theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          } focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                        autoFocus
                      />
                      <textarea
                        placeholder="Description * (e.g., Core mathematics concepts and problem solving)"
                        value={newSubjectDescription}
                        onChange={(e) => setNewSubjectDescription(e.target.value)}
                        required
                        rows={3}
                        className={`w-full border rounded-lg px-4 py-2 ${theme === "dark"
                          ? "bg-slate-800 border-slate-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          } focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none`}
                      />
                      <div className="flex gap-3">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 px-6 py-2 rounded-lg font-semibold transition ${theme === "dark" ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                          Add
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowAddSubject(false);
                            setNewSubjectName("");
                            setNewSubjectDescription("");
                          }}
                          className={`flex-1 px-6 py-2 rounded-lg font-semibold transition ${theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Active Subjects */}
              {loading ? (
                <div className={`text-center py-12 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Loading subjects...
                </div>
              ) : activeSubjects.length === 0 && completedSubjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-12 rounded-2xl border backdrop-blur-xl ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white/80 border-gray-200"
                    }`}
                >
                  <BookOpen className={`w-12 h-12 mx-auto mb-4 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`} />
                  <p className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    No subjects yet. Create your first subject to get started!
                  </p>
                </motion.div>
              ) : (
                <>
                  {activeSubjects.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      {activeSubjects.map((subject, index) => (
                        <motion.div
                          key={subject.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <SubjectCard
                            subject={subject}
                            userId={user.uid}
                            onSelectSubject={setSelectedSubject}
                            onTaskChange={() => setRefreshKey((prev) => prev + 1)}
                            // Rules logic
                            canEdit={true} // always allow edit
                            canDelete={!subject.completed && (!subject.tasks || subject.tasks.length === 0)}
                          // delete only if not completed and no tasks added
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Completed Subjects */}
                  {completedSubjects.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-8"
                    >
                      <h3 className={`text-xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Completed Subjects
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {completedSubjects.map((subject, index) => (
                          <motion.div
                            key={subject.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <SubjectCard
                              subject={subject}
                              userId={user.uid}
                              onSelectSubject={setSelectedSubject}
                              onTaskChange={() => setRefreshKey((prev) => prev + 1)}
                              canEdit={true} // edit allowed
                              canDelete={false} // delete disabled
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          </div>


          {/* Focus Timer Section - Takes 1 column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="rounded-2xl backdrop-blur-xl border p-4
               shadow-sm
               dark:bg-slate-900/50 dark:border-slate-800
               bg-white/70 border-gray-200"
            >
              <PomodoroTimer
                selectedSubject={selectedSubject}
                onSessionComplete={handleSessionComplete}
              />
            </motion.div>
          </div>

        </div>

        {/* Analytics Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Analytics userId={user?.uid} refreshKey={refreshKey} />
        </motion.div>
      </div>
    </div>
  );
}
