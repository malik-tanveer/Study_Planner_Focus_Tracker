import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Analytics() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Focus Hours",
        data: [2, 4, 3, 5, 6],
        backgroundColor: "rgba(99, 102, 241, 0.7)",
      },
    ],
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6">
      <Bar data={data} />
    </div>
  );
}
