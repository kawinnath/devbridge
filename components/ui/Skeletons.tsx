import React from "react";

export function CardSkeleton() {
  return (
    <div className="glass-card-premium rounded-2xl p-6 animate-pulse flex flex-col gap-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
      <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-full" />
      <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-4/5" />
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mt-4" />
    </div>
  );
}

export function ProjectListSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card-premium rounded-2xl p-5 animate-pulse flex justify-between items-center">
          <div className="flex flex-col gap-2.5 w-2/3">
            <div className="h-3.5 bg-indigo-200 dark:bg-indigo-950/40 rounded w-24" />
            <div className="h-5.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2" />
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-28 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card-premium rounded-2xl p-6 h-40 flex flex-col justify-between">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
