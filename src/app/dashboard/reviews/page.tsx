"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/frontend/components/ui/Button";
import { Modal } from "@/frontend/components/ui/Modal";
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ExternalLink, 
  MessageSquare,
  Clock,
  Eye,
  Code
} from "lucide-react";

interface Submission {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  previewUrl: string | null;
  versionNumber: number;
  status: string;
  createdAt: string;
  task: {
    title: string;
    project: { name: string };
  };
  user: {
    fullName: string;
    email: string;
  };
}

export default function ReviewsPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: submissionsData, isLoading } = useQuery<Submission[]>({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await fetch("/api/submissions");
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return res.json();
    },
  });

  const submissions = Array.isArray(submissionsData) ? submissionsData : [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsDetailModalOpen(false);
      setSelectedSubmission(null);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { submissionId: string; content: string }) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      setComment("");
      // Ideally refetch submission detail or comments
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "UNDER_REVIEW": return "bg-purple-100 text-purple-700";
      case "APPROVED": return "bg-green-100 text-green-700";
      case "REVISION_REQUESTED": return "bg-orange-100 text-orange-700";
      case "REJECTED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review Panel</h1>
        <p className="text-gray-500 text-sm">Review and approve employee submissions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Task / Project</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-12 bg-gray-50"></td>
                  </tr>
                ))
              ) : submissions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No submissions pending review.
                  </td>
                </tr>
              ) : (
                submissions?.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{submission.task.title}</div>
                      <div className="text-xs text-gray-500">{submission.task.project.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                          {submission.user.fullName.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{submission.user.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">v{submission.versionNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        title="Review Submission"
        className="max-w-4xl"
      >
        {selectedSubmission && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedSubmission.task.title}</h3>
                <p className="text-sm text-gray-500">{selectedSubmission.task.project.name} • Submitted by {selectedSubmission.user.fullName}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                {selectedSubmission.status.replace("_", " ")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Code className="w-4 h-4" />
                  <span>Content / Code</span>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[400px] font-mono text-xs">
                  <pre>{selectedSubmission.content}</pre>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </div>
                <div className="border border-gray-200 rounded-lg h-[400px] bg-gray-50 flex items-center justify-center overflow-hidden">
                  {selectedSubmission.previewUrl ? (
                    <iframe src={selectedSubmission.previewUrl} className="w-full h-full border-0" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="text-gray-400 mb-2">No preview URL provided</div>
                      <p className="text-xs text-gray-500 italic">Review the code on the left</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MessageSquare className="w-4 h-4" />
                <span>Feedback</span>
              </div>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Add comments or feedback for the employee..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2"
                  onClick={() => {
                    if (comment) addCommentMutation.mutate({ submissionId: selectedSubmission.id, content: comment });
                    updateStatusMutation.mutate({ id: selectedSubmission.id, status: "APPROVED" });
                  }}
                  loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === "APPROVED"}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </Button>
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center space-x-2"
                  onClick={() => {
                    if (comment) addCommentMutation.mutate({ submissionId: selectedSubmission.id, content: comment });
                    updateStatusMutation.mutate({ id: selectedSubmission.id, status: "REVISION_REQUESTED" });
                  }}
                  loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === "REVISION_REQUESTED"}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Revision</span>
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center space-x-2"
                  onClick={() => {
                    if (comment) addCommentMutation.mutate({ submissionId: selectedSubmission.id, content: comment });
                    updateStatusMutation.mutate({ id: selectedSubmission.id, status: "REJECTED" });
                  }}
                  loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === "REJECTED"}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
