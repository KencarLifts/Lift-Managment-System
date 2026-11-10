import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Activity, ClipboardList, PackageX } from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const STATUS_COLORS = {
  Planned: "#94a3b8",
  "In Progress": "#3b82f6",
  Active: "#10b981",
  Maintenance: "#f59e0b",
  "Out of Service": "#ef4444",
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [installs, setInstalls] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [parts, setParts] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Installation.list(),
      base44.entities.WorkOrder.list(),
      base44.entities.Part.list(),
    ]).then(([i, w, p]) => {
      setInstalls(i);
      setWorkOrders(w);
      setParts(p);
    }).finally(() => setLoading(false));
  }, []);

  const activeInstalls = installs.filter((i) => i.status === "Active").length;
  const pendingOrders = workOrders.filter((w) => w.status !== "Completed").length;
  const lowStock = parts.filter((p) => p.quantity <= p.minQuantity).length;

  // status distribution
  const statusData = ["Planned", "In Progress", "Active", "Maintenance", "Out of Service"]
    .map((s) => ({ name: s, value: installs.filter((i) => i.status === s).length }))
    .filter((d) => d.value > 0);

  // model popularity
  const modelMap = {};
  installs.forEach((i) => {
    const m = i.elevatorModel || "Unknown";
    modelMap[m] = (modelMap[m] || 0) + 1;
  });
  const modelData = Object.entries(modelMap).map(([name, value]) => ({ name, value }));

  // installs by month (created_date)
  const monthMap = {};
  installs.forEach((i) => {
    if (!i.created_date) return;
    const d = new Date(i.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  });
  const monthData = Object.entries(monthMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your lift operations and field assets.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Building2} label="Total Installations" value={installs.length} accent="blue" trend={12} />
        <StatCard icon={Activity} label="Active Installs" value={activeInstalls} accent="emerald" trend={8} />
        <StatCard icon={ClipboardList} label="Pending Work Orders" value={pendingOrders} accent="amber" trend={-5} />
        <StatCard icon={PackageX} label="Low Stock Alerts" value={lowStock} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-1">Installations by Month</h3>
          <p className="text-xs text-muted-foreground mb-4">New installations registered over time</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="font-semibold text-foreground mb-1">Status Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Current operational state of all lifts</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-1">Model Popularity</h3>
          <p className="text-xs text-muted-foreground mb-4">Most installed elevator models</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={modelData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }} cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}