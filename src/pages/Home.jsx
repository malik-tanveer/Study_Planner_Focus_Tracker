// Unified Dashboard Page - All sections on one page
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, Plus, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { addSubject, getSubjects, deleteSubject } from "../services/firestoreService";
import SubjectCard from "../components/SubjectCard";
import PomodoroTimer from "../components/PomodoroTimer";
import DashboardStats from "../components/DashboardStats";
import Analytics from "../components/Analytics";
import MotivationalQuote from "../components/MotivationalQuote";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
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
    if (!newSubjectName.trim()) return;

    try {
      await addSubject(user.uid, newSubjectName);
      setNewSubjectName("");
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

  const handleSessionComplete = () => {
    // Trigger refresh when session completes
    setRefreshKey((prev) => prev + 1);
    loadSubjects(); // Refresh subjects to update task stats
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center border border-indigo-500/30">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Study Planner & Focus Tracker</h1>
                <p className="text-xs text-gray-400">
                  {user?.displayName || user?.email || "Welcome"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
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
                <h2 className="text-2xl font-bold text-white">Subjects & Tasks</h2>
              </div>

              {/* Add Subject Section */}
              <div className="mb-6">
                {!showAddSubject ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddSubject(true)}
                    className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition shadow-lg"
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
                    className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 backdrop-blur-xl"
                  >
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Subject name (e.g., Mathematics, History)"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="flex-1 bg-black border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        autoFocus
                      />
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-600 transition"
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
                        }}
                        className="bg-slate-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-600 transition"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </div>

              {/* Subjects Grid */}
              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading subjects...
                </div>
              ) : subjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl"
                >
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    No subjects yet. Create your first subject to get started!
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SubjectCard
                        subject={subject}
                        onDeleteSubject={handleDeleteSubject}
                        userId={user.uid}
                        onSelectSubject={setSelectedSubject}
                        onTaskChange={() => setRefreshKey((prev) => prev + 1)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Focus Timer Section - Takes 1 column */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
