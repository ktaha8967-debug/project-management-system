"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Zap,
  Star,
  Users
} from "lucide-react";

export default function PerformancePage() {
  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["performance-stats"],
    queryFn: async () => {
      const res = await fetch("/api/performance");
      return res.json();
    },
  });

  const { data: report } = useQuery<any>({
    queryKey: ["daily-report"],
    queryFn: async () => {
      const res = await fetch("/api/performance?type=report");
      return res.json();
    },
  });

  const formatSeconds = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance & Analytics</h1>
        <p className="text-gray-500 text-sm">Track your productivity, points and badges.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><CheckCircle2 className="w-5 h-5 text-blue-600" /></div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.completed || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-50 rounded-lg"><Zap className="w-5 h-5 text-purple-600" /></div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Top 5%</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Productivity Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{Math.round(stats?.productivityScore || 0)}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
          </div>
          <p className="text-sm font-medium text-gray-500">Avg. Task Time</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatSeconds(stats?.avgCompletionTimeSeconds || 0)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg"><Star className="w-5 h-5 text-yellow-600" /></div>
          </div>
          <p className="text-sm font-medium text-gray-500">Current Points</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">1,250</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Report Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-lg shadow-blue-200">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6" />
            <h3 className="text-xl font-bold">Daily Report</h3>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-blue-100 text-sm opacity-80 uppercase font-bold tracking-wider">Today's Focus</p>
              <p className="text-3xl font-bold mt-1">{report?.completedCount || 0} Tasks Approved</p>
            </div>
            <div className="h-px bg-white/20 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-xs opacity-80 uppercase font-bold">Time Spent</p>
                <p className="text-xl font-bold">{formatSeconds(report?.totalTimeSeconds || 0)}</p>
              </div>
              <div>
                <p className="text-blue-100 text-xs opacity-80 uppercase font-bold">Pending</p>
                <p className="text-xl font-bold">{report?.pendingCount || 0}</p>
              </div>
            </div>
            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Download Full Report
            </button>
          </div>
        </div>

        {/* Badges & Achievements */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Badges & Achievements</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Fast Finisher", desc: "Completed 5 tasks ahead of deadline", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
              { name: "Team Player", desc: "High engagement in comments", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { name: "Early Bird", desc: "Started timer before 9 AM 5 days in a row", icon: Clock, color: "text-green-500", bg: "bg-green-50" },
              { name: "Code Ninja", desc: "Approved first time 3 times", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-50" },
            ].map(badge => (
              <div key={badge.name} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-all">
                <div className={`p-4 ${badge.bg} rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                </div>
                <h4 className="font-bold text-gray-900">{badge.name}</h4>
                <p className="text-xs text-gray-500 mt-2">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity Graph Placeholder */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Weekly Productivity Graph</span>
          </h3>
          <select className="text-sm border-0 bg-transparent font-bold text-blue-600 outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        <div className="h-48 flex items-end space-x-4">
          {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-50 rounded-t-lg relative group">
              <div 
                className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all duration-500" 
                style={{ height: `${h}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {h}%
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
      </div>
    </div>
  );
}
