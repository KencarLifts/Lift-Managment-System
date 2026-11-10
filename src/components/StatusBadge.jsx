import React from "react";
import { cn } from "@/lib/utils";

const variantMap = {
  // Installation statuses
  Planned: "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  "Out of Service": "bg-red-100 text-red-700 border-red-200",
  // Work order statuses
  Open: "bg-blue-100 text-blue-700 border-blue-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  // Quotation statuses
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Sent: "bg-blue-100 text-blue-700 border-blue-200",
  Accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  // Priority
  Low: "bg-slate-100 text-slate-600 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-amber-100 text-amber-700 border-amber-200",
  Urgent: "bg-red-100 text-red-700 border-red-200",
};

export default function StatusBadge({ value }) {
  if (!value) return <span className="text-muted-foreground text-sm">—</span>;
  const cls = variantMap[value] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", cls)}>
      {value}
    </span>
  );
}