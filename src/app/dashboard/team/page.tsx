"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Award, 
  BarChart3,
  Shield,
  Briefcase
} from "lucide-react";

export default function TeamPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", department: "DEVELOPMENT" });
  const queryClient = useQueryClient();

  const { data: teamsData, isLoading } = useQuery<any[]>({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
  });

  const teams = Array.isArray(teamsData) ? teamsData : [];

  const { data: leaderboardData } = useQuery<any[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/performance?type=leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });

  const leaderboard = Array.isArray(leaderboardData) ? leaderboardData : [];

  const createTeamMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setIsModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Operating System</h1>
          <p className="text-gray-500 text-sm">Manage teams, track performance and boost accountability.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Create Team</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Active Teams</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                [1, 2].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)
              ) : (
                teams?.map(team => (
                  <div key={team.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{team.name}</h4>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mt-1">{team.department}</p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        {team._count?.users || 0} Members
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {team.users?.slice(0, 3).map((u: any) => (
                          <div key={u.id} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-600" title={u.fullName}>
                            {u.fullName.charAt(0)}
                          </div>
                        ))}
                        {(team._count?.users || 0) > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +{team._count.users - 3}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">Manage</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Workload Heatmap (Requirement 7) */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Workload Heatmap</span>
            </h3>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Active Tasks</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Workload</th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams?.[0]?.users?.map((user: any) => {
                    const taskCount = Math.floor(Math.random() * 8); // In real app, fetch actual active count
                    const status = taskCount > 5 ? 'Overloaded' : taskCount > 2 ? 'Normal' : 'Light';
                    const color = taskCount > 5 ? 'text-red-600 bg-red-50' : taskCount > 2 ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                              {user.fullName.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{taskCount} tasks</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${color}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {taskCount > 5 ? (
                            <div className="flex items-center space-x-1 text-xs text-orange-600 font-medium">
                              <Shield className="w-3 h-3" />
                              <span>Suggest Reassignment</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Optimal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {/* ... existing leaderboard ... */}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Team">
        <form onSubmit={(e) => {
          e.preventDefault();
          createTeamMutation.mutate(newTeam);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Frontend Squad"
              onChange={e => setNewTeam({...newTeam, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              onChange={e => setNewTeam({...newTeam, department: e.target.value})}
            >
              <option value="DEVELOPMENT">Development</option>
              <option value="MARKETING">Marketing</option>
              <option value="OPERATIONS">Operations</option>
              <option value="SALES">Sales</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createTeamMutation.isPending}>Create Team</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
