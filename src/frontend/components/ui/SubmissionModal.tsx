"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Upload, File, X } from "lucide-react";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

export const SubmissionModal = ({ isOpen, onClose, taskId, taskTitle }: SubmissionModalProps) => {
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit work");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
      setContent("");
      setPreviewUrl("");
      setFiles([]);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Submit Work: ${taskTitle}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitMutation.mutate({ 
            taskId, 
            content, 
            previewUrl,
            // In a real app, you'd upload files to S3/Cloudinary first
            files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
          });
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content (HTML/CSS or Description)
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] font-mono text-sm"
            placeholder="Paste your code or submission details here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Assets (Images, Docs, Designs)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                  Upload files
                </span>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded text-gray-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview URL (Optional)
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
          />
        </div>
        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={submitMutation.isPending}
          >
            Submit for Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
