import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import InstallationForm from "@/components/InstallationForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, MapPin, ArrowRight } from "lucide-react";

const STATUSES = ["All", "Planned", "In Progress", "Active", "Maintenance", "Out of Service"];

export default function Installations() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [inst, cust] = await Promise.all([
      base44.entities.Installation.list("-created_date", 200),
      base44.entities.Customer.list(),
    ]);
    setItems(inst);
    setCustomers(cust);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const customerName = (id) => customers.find((c) => c.id === id)?.companyName || "—";

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !search ||
        i.factoryNo?.toLowerCase().includes(q) ||
        i.elevatorCode?.toLowerCase().includes(q) ||
        i.address?.toLowerCase().includes(q) ||
        i.elevatorModel?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this installation? This cannot be undone.")) return;
    await base44.entities.Installation.delete(id);
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Installations"
        description="Manage the full lifecycle of every elevator asset."
        actionLabel="New Installation"
        onAction={() => { setEditing(null); setFormOpen(true); }}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search factory no, code, address, model..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Factory NO</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Elevator Code</th>
                  <th className="text-left font-medium px-4 py-3">Address</th>
                  <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Customer</th>
                  <th className="text-left font-medium px-4 py-3 hidden xl:table-cell">Model</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/installations/${i.id}`} className="font-medium text-primary hover:underline">
                        {i.factoryNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{i.elevatorCode || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {i.address || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{customerName(i.customerId)}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground">{i.elevatorModel || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge value={i.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(i); setFormOpen(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(i.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link to={`/installations/${i.id}`} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No installations found. Click "New Installation" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InstallationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        editing={editing}
        customers={customers}
      />
    </div>
  );
}