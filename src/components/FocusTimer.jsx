import React, { useState, useEffect } from "react";

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(1500); // 25 min
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSeconds(1500);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 text-center">
      <h3 className="text-5xl font-bold text-indigo-400 mb-4">{formatTime(seconds)}</h3>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setRunning(!running)}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg font-semibold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
