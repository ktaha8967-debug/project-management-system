"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import Editor from "@monaco-editor/react";
import { Plus, Mail, Eye, Code, Save, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  htmlCode: string;
  createdAt: string;
}

export default function TemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [viewTab, setViewTab] = useState<"drafts" | "library">("library");
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "MARKETING",
    htmlCode: "<html>\n  <body>\n    <h1>Hello {{name}}!</h1>\n  </body>\n</html>"
  });
  
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading } = useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    },
  });

  const templates = Array.isArray(templatesData) ? templatesData : [];

  const { data: libraryTemplatesData, isLoading: libraryLoading } = useQuery<any[]>({
    queryKey: ["templateLibrary"],
    queryFn: async () => {
      const res = await fetch("/api/templates/library");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const libraryTemplates = Array.isArray(libraryTemplatesData) ? libraryTemplatesData : [];

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create template");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setIsModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 text-sm">Manage your email templates and library.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </Button>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setViewTab("library")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${viewTab === "library" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Template Library (Approved)
        </button>
        <button 
          onClick={() => setViewTab("drafts")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${viewTab === "drafts" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          My Drafts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viewTab === "library" ? (
          libraryLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>)
          ) : libraryTemplates?.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Library is empty</h3>
              <p className="text-gray-500 mt-1">Approved templates will appear here.</p>
            </div>
          ) : (
            libraryTemplates?.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="h-40 bg-gray-100 border-b relative overflow-hidden flex items-center justify-center">
                  <div 
                    className="scale-[0.25] origin-center bg-white w-[600px] h-[400px] shadow-2xl p-4 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: template.htmlCode }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="secondary">
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded-full">APPROVED</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">Approved by {template.approvedBy}</p>
                    <Button size="sm" variant="outline" className="text-xs">Use in Campaign</Button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>)
          ) : templates?.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No drafts found</h3>
              <p className="text-gray-500 mt-1">Start building your first email template.</p>
            </div>
          ) : (
            templates?.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all">
                <div className="h-40 bg-gray-100 border-b relative overflow-hidden flex items-center justify-center">
                  <div 
                    className="scale-[0.25] origin-center bg-white w-[600px] h-[400px] shadow-2xl p-4 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: template.htmlCode }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900">{template.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{template.category}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">{(template as any).status}</p>
                    <div className="flex space-x-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500"><Code className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded-md text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Template Builder">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g. Welcome Email"
                value={newTemplate.name}
                onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg outline-none bg-white"
                value={newTemplate.category}
                onChange={e => setNewTemplate({...newTemplate, category: e.target.value})}
              >
                <option value="MARKETING">Marketing</option>
                <option value="TRANSACTIONAL">Transactional</option>
                <option value="NEWSLETTER">Newsletter</option>
              </select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="flex border-b bg-gray-50">
              <button 
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "code" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              >
                Code Editor
              </button>
              <button 
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 text-sm font-medium ${activeTab === "preview" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              >
                Live Preview
              </button>
            </div>
            
            <div className="h-64">
              {activeTab === "code" ? (
                <Editor
                  height="100%"
                  defaultLanguage="html"
                  theme="vs-light"
                  value={newTemplate.htmlCode}
                  onChange={(val) => setNewTemplate({...newTemplate, htmlCode: val || ""})}
                  options={{ minimap: { enabled: false }, fontSize: 12 }}
                />
              ) : (
                <div className="h-full p-4 overflow-auto bg-white border">
                  <div dangerouslySetInnerHTML={{ __html: newTemplate.htmlCode }} />
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => createTemplateMutation.mutate(newTemplate)} loading={createTemplateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" /> Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
