"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { Plus, Briefcase, Calendar, User, ChevronRight, Settings } from "lucide-react";
import { Skeleton } from "@/frontend/components/ui/Skeleton";
import { EmptyState } from "@/frontend/components/ui/EmptyState";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  _count: {
    tasks: number;
  };
}

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", type: "PRODUCT", description: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ projects: Project[]; pagination: any }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const projects = Array.isArray(data?.projects) ? data.projects : [];

  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof newProject) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      let result;
      try {
        result = await res.json();
      } catch (e) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(result.details || result.error || `Error ${res.status}: ${res.statusText}`);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsModalOpen(false);
      setNewProject({ name: "", type: "PRODUCT", description: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProjectMutation.mutate(newProject);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm">Manage and track all your active projects.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <div className="pt-4 border-t flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="max-w-2xl mx-auto py-12">
          <EmptyState 
            title="No projects yet" 
            description="Start by creating your first project to manage tasks and templates." 
            type="general" 
          />
          <div className="mt-6 text-center">
            <Button onClick={() => setIsModalOpen(true)} variant="outline">Create First Project</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all group flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    project.type === "PRODUCT" ? "bg-purple-100 text-purple-700" :
                    project.type === "CLIENT" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {project.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-4 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
                
                <div className="mt-6 flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-xs text-gray-500 space-x-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{project._count.tasks} Tasks</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t rounded-b-xl flex items-center justify-between">
                <Link href={`/dashboard/projects/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                    <Settings className="w-4 h-4" />
                    <span>Manage Project</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleSubmit} className="space-y-4">
          {createProjectMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>{createProjectMutation.error.message}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Website Redesign"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select
              value={newProject.type}
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="PRODUCT">Product</option>
              <option value="CLIENT">Client</option>
              <option value="INTERNAL">Internal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Briefly describe the project goals..."
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={createProjectMutation.isPending}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
