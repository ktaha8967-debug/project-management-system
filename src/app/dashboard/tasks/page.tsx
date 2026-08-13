"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  User, 
  Filter, 
  Send, 
  LayoutGrid, 
  List, 
  RefreshCw, 
  Link2, 
  Calendar 
} from "lucide-react";
import { SubmissionModal } from "@/frontend/components/ui/SubmissionModal";
import { useSession } from "next-auth/react";
import { KanbanBoard } from "@/frontend/components/ui/KanbanBoard";
import { TimeTracker } from "@/frontend/components/ui/TimeTracker";
import { CalendarView } from "@/frontend/components/ui/CalendarView";
import { TableRowSkeleton } from "@/frontend/components/ui/Skeleton";
import { EmptyState } from "@/frontend/components/ui/EmptyState";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  createdAt: string;
  deadline: string | null;
  assigneeId: string;
  isRecurring: boolean;
  recurrenceType: string | null;
  dependencyTaskId: string | null;
  delayReason: string | null;
  project: { name: string };
  assignedTo: { fullName: string };
}

export default function TasksPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "calendar">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{id: string, title: string} | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    projectId: "",
    assigneeId: "",
    type: "NORMAL",
    priority: "MEDIUM",
    description: "",
    isRecurring: false,
    recurrenceType: "WEEKLY",
    dependencyTaskId: ""
  });
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ tasks: Task[]; pagination: any }>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const tasks = Array.isArray(tasksData?.tasks) ? tasksData.tasks : [];

  const { data: projectsData } = useQuery<{ projects: any[]; pagination: any }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];

  const { data: users } = useQuery<any[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/auth/users");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsModalOpen(false);
    },
  });

  const isOverdue = (deadline: string | null, status: string) => {
    if (!deadline || status === "APPROVED") return false;
    return new Date(deadline) < new Date();
  };

  const getStatusColor = (status: string, deadline: string | null) => {
    if (isOverdue(deadline, status)) return "bg-red-100 text-red-700 border border-red-200";
    switch (status) {
      case "TODO": return "bg-gray-100 text-gray-700";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
      case "SUBMITTED": return "bg-yellow-100 text-yellow-700";
      case "UNDER_REVIEW": return "bg-purple-100 text-purple-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "NEEDS_REVISION": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "text-red-600";
      case "MEDIUM": return "text-orange-600";
      case "LOW": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const currentUserId = (session?.user as any)?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm">Monitor and manage task progress across projects.</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-md ${viewMode === "kanban" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("calendar")} className={`p-1.5 rounded-md ${viewMode === "calendar" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}><Calendar className="w-4 h-4" /></button>
          </div>
          <Button variant="outline" className="flex items-center space-x-2"><Filter className="w-4 h-4" /><span>Filter</span></Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2"><Plus className="w-4 h-4" /><span>New Task</span></Button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        <KanbanBoard tasks={tasks || []} />
      ) : viewMode === "calendar" ? (
        <CalendarView tasks={tasks || []} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Task Title</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Assignee</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Timing</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasksLoading ? (
                  [1, 2, 3, 4, 5].map((i) => <TableRowSkeleton key={i} />)
                ) : tasks?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <EmptyState 
                        title="No tasks found" 
                        description="Relax! You have no pending tasks. Or create one to get started." 
                        type="tasks" 
                      />
                    </td>
                  </tr>
                ) : (
                  tasks?.map((task) => {
                    const isBlocked = task.dependencyTaskId && tasks?.find(t => t.id === task.dependencyTaskId)?.status !== "APPROVED";
                    return (
                      <tr key={task.id} className={`hover:bg-gray-50 transition-colors ${isOverdue(task.deadline, task.status) ? 'bg-red-50/30' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${isOverdue(task.deadline, task.status) ? 'text-red-700' : 'text-gray-900'}`}>{task.title}</span>
                            {isOverdue(task.deadline, task.status) && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" title="Task is overdue!" />}
                            {task.isRecurring && <RefreshCw className="w-3 h-3 text-blue-500" title={`Recurring: ${task.recurrenceType}`} />}
                            {task.dependencyTaskId && <Link2 className="w-3 h-3 text-orange-500" title="Has dependency" />}
                          </div>
                          {isOverdue(task.deadline, task.status) && task.delayReason && <p className="text-[10px] text-red-500 mt-1 italic">Reason: {task.delayReason}</p>}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${getStatusColor(task.status, task.deadline)}`}>{task.status.replace("_", " ")}</span>
                            <span className={`text-[8px] font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{task.project.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">{task.assignedTo.fullName.charAt(0)}</div>
                            <span className="text-sm text-gray-700">{task.assignedTo.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.assigneeId === currentUserId && task.status !== "APPROVED" && (
                            isBlocked ? (
                              <div className="flex items-center space-x-1 text-orange-500 cursor-help" title={`Blocked by: ${tasks.find(t => t.id === task.dependencyTaskId)?.title}`}>
                                <Link2 className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Blocked</span>
                              </div>
                            ) : <TimeTracker taskId={task.id} />
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {task.assigneeId === currentUserId && task.status !== "APPROVED" && (
                            <Button size="sm" variant="outline" className="flex items-center space-x-1 ml-auto" disabled={!!isBlocked} onClick={() => { setSelectedTask({ id: task.id, title: task.title }); setIsSubmitModalOpen(true); }}>
                              <Send className="w-3 h-3" /><span>Submit</span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate(newTask); }} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label><input type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Project</label><select className="w-full px-4 py-2 border rounded-lg outline-none bg-white" value={newTask.projectId} onChange={(e) => setNewTask({...newTask, projectId: e.target.value})} required><option value="">Select Project</option>{projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label><select className="w-full px-4 py-2 border rounded-lg outline-none bg-white" value={newTask.assigneeId} onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})} required><option value="">Select Assignee</option>{users?.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <input type="checkbox" id="isRecurring" checked={newTask.isRecurring} onChange={(e) => setNewTask({...newTask, isRecurring: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">Recurring Task</label>
            </div>
            {newTask.isRecurring && (<select className="w-full px-4 py-2 border rounded-lg outline-none bg-white" value={newTask.recurrenceType} onChange={(e) => setNewTask({...newTask, recurrenceType: e.target.value})}><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select>)}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Dependency (Wait for task...)</label><select className="w-full px-4 py-2 border rounded-lg outline-none bg-white" value={newTask.dependencyTaskId} onChange={(e) => setNewTask({...newTask, dependencyTaskId: e.target.value})}><option value="">No Dependency</option>{tasks?.filter(t => t.status !== "APPROVED").map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}</select></div>
          <div className="flex space-x-3 pt-4"><Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button type="submit" className="flex-1" loading={createTaskMutation.isPending}>Create Task</Button></div>
        </form>
      </Modal>

      {selectedTask && <SubmissionModal isOpen={isSubmitModalOpen} onClose={() => { setIsSubmitModalOpen(false); setSelectedTask(null); }} taskId={selectedTask.id} taskTitle={selectedTask.title} />}
    </div>
  );
}
