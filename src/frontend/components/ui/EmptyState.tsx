"use client";

import React from "react";
import { Coffee, Inbox, Search, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  type?: "tasks" | "search" | "general" | "success";
}

export const EmptyState = ({ title, description, type = "general" }: EmptyStateProps) => {
  const icons = {
    tasks: <Coffee className="w-12 h-12 text-gray-300" />,
    search: <Search className="w-12 h-12 text-gray-300" />,
    general: <Inbox className="w-12 h-12 text-gray-300" />,
    success: <Sparkles className="w-12 h-12 text-yellow-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-3xl">
      <div className="mb-4">
        {icons[type]}
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
};
