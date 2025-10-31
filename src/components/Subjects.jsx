import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Subjects() {
  const [subjectName, setSubjectName] = useState("");
  const [subjects, setSubjects] = useState([]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    await addDoc(collection(db, "subjects"), { name: subjectName });
    setSubjectName("");
    loadSubjects();
  };

  const loadSubjects = async () => {
    const snapshot = await getDocs(collection(db, "subjects"));
    setSubjects(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div className="bg-slate-800/50 rounded-xl p-5">
      <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add new subject..."
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
        />
        <button className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg font-semibold">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {subjects.map((s) => (
          <li key={s.id} className="bg-slate-700/60 px-3 py-2 rounded-lg">
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
