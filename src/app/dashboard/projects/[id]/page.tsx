"use client";

import React, { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart,
  LayoutGrid,
  Plus,
  Send,
  Link2
} from "lucide-react";
import { GanttChart } from "@/frontend/components/ui/GanttChart";
import { TimeTracker } from "@/frontend/components/ui/TimeTracker";

export default function ProjectDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", deadline: "" });
  const [newTask, setNewTask] = useState({
    title: "",
    assigneeId: "",
    type: "NORMAL",
    priority: "MEDIUM",
    description: "",
    deadline: ""
  });
  const queryClient = useQueryClient();

  const { data: project, isLoading: projectLoading } = useQuery<any>({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Project not found");
      return res.json();
    },
  });

  const { data: milestones, isLoading: milestonesLoading } = useQuery<any[]>({
    queryKey: ["milestones", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/milestones?projectId=${params.id}`);
      return res.json();
    },
  });

  const { data: users } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users");
      return res.json();
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId: params.id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", params.id] });
      setIsModalOpen(false);
      setNewMilestone({ title: "", deadline: "" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId: params.id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", params.id] });
      setIsTaskModalOpen(false);
      setNewTask({ title: "", assigneeId: "", type: "NORMAL", priority: "MEDIUM", description: "", deadline: "" });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones", params.id] });
    },
  });

  if (projectLoading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading project data...</div>;
  if (!project) return <div className="p-8 text-center text-red-500 font-bold">Project not found</div>;

  const completionRate = milestones?.length 
    ? (milestones.filter(m => m.status === "COMPLETED").length / milestones.length) * 100 
    : 0;

  const overdueTasksCount = project.tasks?.filter((t: any) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "APPROVED").length || 0;

  return (
    <div className="space-y-8">
      {/* Project Header & Health */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-gray-900">{project.name}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">{project.type}</span>
            </div>
            <p className="text-gray-500 max-w-2xl leading-relaxed">{project.description}</p>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                <Calendar className="w-4 h-4" />
                <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-xs font-medium">
                <LayoutGrid className="w-4 h-4" />
                <span>{project.tasks?.length || 0} Total Tasks</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 w-full md:w-auto">
            <div className={`p-4 rounded-2xl border ${overdueTasksCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} transition-colors`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${overdueTasksCount > 0 ? 'text-red-600' : 'text-green-600'}`}>Project Health</p>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`w-5 h-5 ${overdueTasksCount > 0 ? 'text-red-600 rotate-180' : 'text-green-600'}`} />
                <span className={`text-xl font-black ${overdueTasksCount > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {overdueTasksCount > 2 ? 'At Risk' : overdueTasksCount > 0 ? 'Warning' : 'Healthy'}
                </span>
              </div>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-blue-100">Add Milestone</Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-10">
          <div className="flex justify-between items-end mb-3">
            <p className="text-xs font-black text-gray-400 uppercase tracking-tighter">Milestone Completion</p>
            <p className="text-sm font-black text-blue-600">{Math.round(completionRate)}%</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-50">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-1000 ease-out shadow-inner" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Visual Timeline Section */}
      <GanttChart 
        tasks={project.tasks || []} 
        milestones={milestones || []} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Milestones Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-black text-gray-900 flex items-center space-x-3 uppercase tracking-tight">
            <Target className="w-6 h-6 text-blue-600" />
            <span>Strategic Milestones</span>
          </h3>
          <div className="space-y-5">
            {milestones?.length === 0 ? (
              <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm italic">No milestones defined for this project.</p>
              </div>
            ) : (
              milestones?.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start space-x-5 group">
                  {index !== milestones.length - 1 && (
                    <div className="absolute left-[19px] top-12 w-[2px] h-10 bg-gray-100 group-hover:bg-blue-100 transition-colors" />
                  )}
                  <div className={`mt-2 w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${
                    milestone.status === 'COMPLETED' ? 'border-green-500 bg-green-50 scale-110 shadow-sm shadow-green-100' : 'border-gray-200 bg-white'
                  }`}>
                    {milestone.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 group-hover:bg-blue-400 transition-colors" />
                    )}
                  </div>
                  <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${
                    milestone.status === 'COMPLETED' ? 'bg-gray-50/50 border-gray-100 opacity-70' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{milestone.title}</h4>
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500 font-medium">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                          </div>
                          {milestone.status === 'COMPLETED' && <span className="text-green-600 font-black uppercase tracking-widest text-[9px]">Finished</span>}
                        </div>
                      </div>
                      {milestone.status !== 'COMPLETED' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-[10px] h-8 font-black uppercase tracking-wider hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                          onClick={() => updateMilestoneMutation.mutate({ id: milestone.id, status: "COMPLETED" })}
                          loading={updateMilestoneMutation.isPending && updateMilestoneMutation.variables?.id === milestone.id}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Stats Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-black text-gray-900 mb-6 flex items-center space-x-3 uppercase tracking-tight text-sm">
              <BarChart className="w-5 h-5 text-purple-600" />
              <span>Project DNA</span>
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-3 border-b border-gray-50 group">
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">Total Velocity</span>
                <span className="text-sm font-black text-gray-900">{project.tasks?.length || 0} Tasks</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50 group">
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">Strategic Goals</span>
                <span className="text-sm font-black text-gray-900">{milestones?.length || 0} Milestones</span>
              </div>
              <div className="flex justify-between items-center py-3 group">
                <span className="text-sm text-gray-500 font-medium group-hover:text-gray-900 transition-colors">Risk Debt</span>
                <span className={`text-sm font-black ${overdueTasksCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{overdueTasksCount} Delayed</span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border transition-colors ${overdueTasksCount > 0 ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
            <h4 className={`text-sm font-black flex items-center space-x-3 mb-3 uppercase tracking-tight ${overdueTasksCount > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
              <AlertTriangle className="w-5 h-5" />
              <span>Intelligence Report</span>
            </h4>
            <p className={`text-xs leading-relaxed font-medium ${overdueTasksCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
              {overdueTasksCount > 0 
                ? `${overdueTasksCount} tasks are currently overdue. Strategic re-allocation recommended to protect upcoming milestones.`
                : "All systems operational. Execution velocity is within optimal parameters."}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900 flex items-center space-x-3 uppercase tracking-tight">
            <LayoutGrid className="w-6 h-6 text-purple-600" />
            <span>Project Tasks</span>
          </h3>
          <Button onClick={() => setIsTaskModalOpen(true)} size="sm" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Task Title</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Assignee</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Timing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.tasks?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic text-sm">No tasks assigned to this project yet.</td>
                </tr>
              ) : (
                project.tasks?.map((task: any) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{task.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">#{task.id.slice(-6)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {task.assignedTo?.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{task.assignedTo?.fullName || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        task.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        task.status === 'TODO' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.status !== 'APPROVED' && <TimeTracker taskId={task.id} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Project Task">
        <form onSubmit={(e) => {
          e.preventDefault();
          createTaskMutation.mutate(newTask);
        }} className="space-y-4 p-2">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Task Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="e.g. Design System Implementation"
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Assignee</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                value={newTask.assigneeId}
                onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                required
              >
                <option value="">Select Assignee</option>
                {users?.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
              <select 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Task Type</label>
            <select 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
              value={newTask.type}
              onChange={e => setNewTask({...newTask, type: e.target.value})}
            >
              <option value="NORMAL">Normal</option>
              <option value="DEV_TASK">Development</option>
              <option value="MARKETING">Marketing</option>
              <option value="EMAIL_TEMPLATE">Email Template</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Deadline</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={newTask.deadline}
              onChange={e => setNewTask({...newTask, deadline: e.target.value})}
            />
          </div>
          <div className="flex space-x-3 pt-6">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-blue-100 bg-purple-600 hover:bg-purple-700" loading={createTaskMutation.isPending}>Create Task</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Strategic Milestone">
        <form onSubmit={(e) => {
          e.preventDefault();
          createMilestoneMutation.mutate(newMilestone);
        }} className="space-y-5 p-2">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Milestone Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              placeholder="e.g. Phase 1 Alpha Delivery"
              value={newMilestone.title}
              onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Deadline</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={newMilestone.deadline}
              onChange={e => setNewMilestone({...newMilestone, deadline: e.target.value})}
              required
            />
          </div>
          <div className="flex space-x-3 pt-6">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-blue-100" loading={createMilestoneMutation.isPending}>Activate Milestone</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
