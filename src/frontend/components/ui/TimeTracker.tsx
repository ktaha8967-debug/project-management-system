"use client";

import { useState, useEffect } from "react";
import { Play, Square, Clock } from "lucide-react";
import { Button } from "./Button";

interface TimeTrackerProps {
  taskId: string;
}

export const TimeTracker = ({ taskId }: TimeTrackerProps) => {
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const startTimer = async () => {
    try {
      const res = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveLogId(data.id);
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const stopTimer = async () => {
    try {
      const res = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stop: true, logId: activeLogId }),
      });
      if (res.ok) {
        setIsPaused(true);
        setActiveLogId(null);
        setSeconds(0);
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center space-x-3 p-1.5 rounded-xl border transition-all duration-300 ${!isPaused ? 'bg-blue-50 border-blue-200 shadow-sm animate-pulse-soft' : 'bg-gray-50 border-gray-100'}`}>
      <div className={`flex items-center space-x-2 text-xs font-black font-mono ${!isPaused ? 'text-blue-700' : 'text-gray-500'}`}>
        <Clock className={`w-3.5 h-3.5 ${!isPaused ? 'text-blue-600 animate-spin-slow' : 'text-gray-400'}`} />
        <span>{formatTime(seconds)}</span>
      </div>
      {isPaused ? (
        <button onClick={startTimer} className="h-7 w-7 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow-sm border border-gray-100 hover:bg-blue-50 transition-colors">
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : (
        <button onClick={stopTimer} className="h-7 w-7 flex items-center justify-center bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all">
          <Square className="w-3 h-3 fill-current" />
        </button>
      )}
    </div>
  );
};
