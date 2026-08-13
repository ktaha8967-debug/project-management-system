"use client";

import React from "react";

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export const TaskSkeleton = () => (
  <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm space-y-3">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center space-x-4 py-4 px-6 border-b border-gray-50">
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-4 w-12 ml-auto" />
  </div>
);
