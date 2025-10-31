import React from "react";
import Navbar from "../components/Navbar";
import Subjects from "../components/Subjects";
import Tasks from "../components/Tasks";
import FocusTimer from "../components/FocusTimer";
import Analytics from "../components/Analytics";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="p-6 space-y-12 max-w-5xl mx-auto">
        {/* Day 2 */}
        <section>
          <h2 className="text-2xl font-bold mb-3 text-indigo-400">
            🎯 Subjects & Tasks
          </h2>
          <Subjects />
          <Tasks />
        </section>

        {/* Day 3 */}
        <section>
          <h2 className="text-2xl font-bold mb-3 text-pink-400">
            ⏱ Focus Timer
          </h2>
          <FocusTimer />
        </section>

        {/* Day 4 */}
        <section>
          <h2 className="text-2xl font-bold mb-3 text-green-400">
            📊 Performance Analytics
          </h2>
          <Analytics />
        </section>
      </main>
    </div>
  );
}
