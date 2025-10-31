import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Tasks() {
  const [task, setTask] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!task || !deadline) return;
    await addDoc(collection(db, "tasks"), { task, deadline });
    setTask("");
    setDeadline("");
    loadTasks();
  };

  const loadTasks = async () => {
    const snapshot = await getDocs(collection(db, "tasks"));
    setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="bg-slate-800/50 rounded-xl p-5 mt-4">
      <form onSubmit={addTask} className="grid grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter task..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="col-span-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="col-span-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
        />
        <button className="col-span-1 bg-pink-500 hover:bg-pink-600 px-4 py-2 rounded-lg font-semibold">
          Add Task
        </button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="bg-slate-700/60 px-3 py-2 rounded-lg">
            <div className="flex justify-between">
              <span>{t.task}</span>
              <span className="text-gray-400 text-sm">{t.deadline}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
