import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Completed"];
const FILTERS = ["All", "Open", "In Progress", "Completed"];

const empty = { title: "", description: "", technicianId: "", installationId: "", dueDate: "", priority: "Medium", status: "Open", notes: "" };

export default function WorkOrders() {
  const [orders, setOrders] = useState([]);
  const [techs, setTechs] = useState([]);
  const [installs, setInstalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [o, t, i] = await Promise.all([
      base44.entities.WorkOrder.list("-created_date", 200),
      base44.entities.Technician.list(),
      base44.entities.Installation.list(),
    ]);
    setOrders(o); setTechs(t); setInstalls(i); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const techName = (id) => techs.find((t) => t.id === id)?.name || "—";
  const instSerial = (id) => installs.find((i) => i.id === id)?.serialNumber || "—";

  const filtered = useMemo(() => filter === "All" ? orders : orders.filter((o) => o.status === filter), [orders, filter]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (o) => { setEditing(o); setForm({ ...empty, ...o }); setOpen(true); };

  const save = async () => {
    if (!form.title) return;
    if (editing) {
      await base44.entities.WorkOrder.update(editing.id, form);
    } else {
      await base44.entities.WorkOrder.create(form);
    }
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this work order?")) return;
    await base44.entities.WorkOrder.delete(id);
    load();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Work Orders" description="Create, assign and track field tasks across your installations."
        actionLabel="New Work Order" onAction={openNew} />

      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <div key={o.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">{o.title}</h3>
                <StatusBadge value={o.priority} />
              </div>
              {o.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{o.description}</p>}
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Technician</span><span className="font-medium text-foreground">{techName(o.technicianId)}</span></div>
                <div className="flex justify-between"><span>Installation</span><span className="font-medium text-foreground">{instSerial(o.installationId)}</span></div>
                <div className="flex justify-between"><span>Due date</span><span className="font-medium text-foreground">{o.dueDate || "—"}</span></div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <StatusBadge value={o.status} />
                <div className="flex gap-1">
                  <button onClick={() => openEdit(o)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(o.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-12">No work orders found.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Work Order" : "New Work Order"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Technician</Label>
                <Select value={form.technicianId} onValueChange={(v) => set("technicianId", v)}>
                  <SelectTrigger><SelectValue placeholder="Assign" /></SelectTrigger>
                  <SelectContent>{techs.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Installation</Label>
                <Select value={form.installationId} onValueChange={(v) => set("installationId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{installs.map((i) => <SelectItem key={i.id} value={i.id}>{i.serialNumber}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.title}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}