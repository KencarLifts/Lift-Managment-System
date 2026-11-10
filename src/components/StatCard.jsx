import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, accent = "blue", trend }) {
  const accents = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-1 tracking-tight">{value}</p>
        </div>
        <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center", accents[accent])}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 text-xs">
          {trend >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-600" />
          )}
          <span className={trend >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}