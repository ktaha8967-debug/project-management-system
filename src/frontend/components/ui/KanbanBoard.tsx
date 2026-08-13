"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Clock, User, Send, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: { name: string };
  assignedTo: { fullName: string };
}

interface KanbanBoardProps {
  tasks: Task[];
}

const columns = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "SUBMITTED", title: "Submitted" },
  { id: "UNDER_REVIEW", title: "Under Review" },
  { id: "NEEDS_REVISION", title: "Revision" },
  { id: "APPROVED", title: "Approved" },
];

export const KanbanBoard = ({ tasks }: KanbanBoardProps) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(["tasks"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((t: any) => t.id === id ? { ...t, status } : t);
        }
        return {
          ...old,
          tasks: old.tasks?.map((t: any) => t.id === id ? { ...t, status } : t)
        };
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // Rollback
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => {
      // Always refetch after error or success:
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateStatusMutation.mutate({ id: taskId, status });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500";
      case "MEDIUM": return "bg-orange-500";
      case "LOW": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 min-h-[600px]">
      {columns.map((column) => (
        <div
          key={column.id}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, column.id)}
          className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              {column.title}
              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {tasks.filter((t) => t.status === column.id).length}
              </span>
            </h3>
          </div>

          <div className="space-y-3">
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, task.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-8 h-1 rounded-full ${getPriorityColor(task.priority)}`} />
                    <span className="text-[10px] text-gray-400 font-mono">#{task.id.slice(-4)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{task.project.name}</p>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">Just now</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.status === "IN_PROGRESS" && (
                        <button className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Submit Work">
                          <Send className="w-3 h-3" />
                        </button>
                      )}
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-white shadow-sm">
                        {task.assignedTo.fullName.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
