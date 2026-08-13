"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { Plus, Users, Mail, Phone, Tag, MoreVertical } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
  assignedTo: {
    fullName: string;
  };
}

export default function LeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", status: "NEW" });
  const queryClient = useQueryClient();

  const { data: leadsData, isLoading } = useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });

  const leads = Array.isArray(leadsData) ? leadsData : [];

  const createLeadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsModalOpen(false);
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-700";
      case "CONTACTED": return "bg-purple-100 text-purple-700";
      case "INTERESTED": return "bg-yellow-100 text-yellow-700";
      case "MEETING_BOOKED": return "bg-orange-100 text-orange-700";
      case "CLOSED": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM Leads</h1>
          <p className="text-gray-500 text-sm">Manage potential clients and track communication status.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>)
        ) : leads?.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">No leads yet</h3>
            <p className="text-sm text-gray-500">Your potential client list will appear here.</p>
          </div>
        ) : (
          leads?.map(lead => (
            <div key={lead.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:border-blue-200 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{lead.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 space-x-3 mt-1">
                    <span className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {lead.email}</span>
                    <span className="flex items-center"><Tag className="w-3 h-3 mr-1" /> {lead.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${getStatusStyle(lead.status)}`}>
                  {lead.status.replace("_", " ")}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Lead">
        <form onSubmit={e => {
          e.preventDefault();
          createLeadMutation.mutate(newLead);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g. John Doe"
              onChange={e => setNewLead({...newLead, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="john@example.com"
              onChange={e => setNewLead({...newLead, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none bg-white"
              onChange={e => setNewLead({...newLead, status: e.target.value})}
            >
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createLeadMutation.isPending}>Add Lead</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
