'use client';

import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-sanchay-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
};

export const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-sanchay-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5 flex-1">
          <LoadingSkeleton className="h-4 w-2/3" />
          <LoadingSkeleton className="h-3 w-1/3" />
        </div>
      </div>
      <LoadingSkeleton className="h-12 w-full rounded-lg" />
      <div className="flex justify-between items-center pt-2">
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};
