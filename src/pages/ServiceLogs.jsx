import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench } from "lucide-react";

const TYPES = ["All", "Maintenance", "Repair", "Emergency", "Inspection", "Part Replacement"];

export default function ServiceLogs() {
  const [logs, setLogs] = useState([]);
  const [techs, setTechs] = useState([]);
  const [installs, setInstalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    Promise.all([
      base44.entities.ServiceLog.list("-date", 200),
      base44.entities.Technician.list(),
      base44.entities.Installation.list(),
    ]).then(([l, t, i]) => { setLogs(l); setTechs(t); setInstalls(i); setLoading(false); });
  }, []);

  const techName = (id) => techs.find((t) => t.id === id)?.name || "—";
  const instSerial = (id) => installs.find((i) => i.id === id)?.serialNumber || "—";
  const shown = filter === "All" ? logs : logs.filter((l) => l.type === filter);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Service Logs" description="All maintenance, repair and inspection records across installations." />

      <div className="mb-5">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t === "All" ? "All types" : t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {shown.map((l) => (
              <div key={l.id} className="p-4 hover:bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusBadge value={l.type} />
                    <Link to={`/installations/${l.installationId}`} className="text-sm font-medium text-primary hover:underline">{instSerial(l.installationId)}</Link>
                  </div>
                  {l.description && <p className="text-sm text-muted-foreground">{l.description}</p>}
                  {l.partsUsed && <p className="text-xs text-muted-foreground mt-0.5">Parts: {l.partsUsed}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{techName(l.technicianId)}</p>
                  <p className="text-xs text-muted-foreground">{l.date}</p>
                </div>
              </div>
            ))}
            {shown.length === 0 && <p className="text-center py-12 text-muted-foreground">No service logs found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}