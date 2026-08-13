"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { 
  BookOpen, 
  Search, 
  Plus, 
  FileText, 
  ChevronRight,
  Book,
  Tag
} from "lucide-react";

export default function KnowledgePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSOP, setNewSOP] = useState({ title: "", content: "", category: "GENERAL" });
  const [selectedSOP, setSelectedSOP] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: sopsData, isLoading } = useQuery<any[]>({
    queryKey: ["sops", searchQuery],
    queryFn: async () => {
      const url = searchQuery ? `/api/sops?q=${searchQuery}` : "/api/sops";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch SOPs");
      return res.json();
    },
  });

  const sops = Array.isArray(sopsData) ? sopsData : [];

  const createSOPMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/sops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setIsModalOpen(false);
      setNewSOP({ title: "", content: "", category: "GENERAL" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 text-sm">Access SOPs, guides, and training documentation.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New SOP</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
          placeholder="Search SOPs by title, content or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories / Sidebar */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Categories</h3>
          <div className="space-y-1">
            {["General", "Technical", "Onboarding", "Sales", "Operations"].map(cat => (
              <button key={cat} className="w-full flex items-center justify-between p-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-blue-500" />
                  <span>{cat}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>

        {/* SOP Content */}
        <div className="lg:col-span-3">
          {selectedSOP ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <button 
                onClick={() => setSelectedSOP(null)}
                className="text-sm text-blue-600 hover:underline mb-4 flex items-center space-x-1"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Back to list</span>
              </button>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedSOP.title}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full uppercase">{selectedSOP.category}</span>
                    <span className="text-xs text-gray-400">• Updated {new Date(selectedSOP.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap pt-6 border-t">
                {selectedSOP.content}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>)
              ) : sops?.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No SOPs found matching your search.</p>
                </div>
              ) : (
                sops?.map(sop => (
                  <div 
                    key={sop.id} 
                    onClick={() => setSelectedSOP(sop)}
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
                        <FileText className="w-5 h-5 text-blue-600 group-hover:text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{sop.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{sop.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase">{sop.category}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New SOP">
        <form onSubmit={(e) => {
          e.preventDefault();
          createSOPMutation.mutate(newSOP);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Code Review Process"
              value={newSOP.title}
              onChange={e => setNewSOP({...newSOP, title: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              value={newSOP.category}
              onChange={e => setNewSOP({...newSOP, category: e.target.value})}
            >
              <option value="GENERAL">General</option>
              <option value="TECHNICAL">Technical</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="SALES">Sales</option>
              <option value="OPERATIONS">Operations</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Text/Markdown)</label>
            <textarea 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
              placeholder="Detail your standard operating procedure here..."
              value={newSOP.content}
              onChange={e => setNewSOP({...newSOP, content: e.target.value})}
              required
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createSOPMutation.isPending}>Save SOP</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
