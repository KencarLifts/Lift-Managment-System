import React, { useState, useEffect } from "react";
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

const STATUSES = ["Draft", "Sent", "Accepted", "Rejected"];
const empty = { quotationNumber: "", customerId: "", installationId: "", totalValue: 0, status: "Draft", date: "", notes: "" };

export default function Quotations() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [installs, setInstalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [q, c, i] = await Promise.all([
      base44.entities.Quotation.list("-created_date", 200),
      base44.entities.Customer.list(),
      base44.entities.Installation.list(),
    ]);
    setItems(q); setCustomers(c); setInstalls(i); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm({ ...empty, quotationNumber: `Q-${Date.now().toString().slice(-6)}` }); setOpen(true); };
  const openEdit = (q) => { setEditing(q); setForm({ ...empty, ...q }); setOpen(true); };

  const save = async () => {
    if (!form.quotationNumber) return;
    const payload = { ...form, totalValue: Number(form.totalValue) || 0 };
    if (editing) await base44.entities.Quotation.update(editing.id, payload);
    else await base44.entities.Quotation.create(payload);
    setOpen(false); load();
  };

  const remove = async (id) => { if (!confirm("Delete this quotation?")) return; await base44.entities.Quotation.delete(id); load(); };

  const customerName = (id) => customers.find((c) => c.id === id)?.companyName || "—";
  const instSerial = (id) => installs.find((i) => i.id === id)?.serialNumber || "—";

  const totalValue = items.reduce((s, q) => s + (Number(q.totalValue) || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Quotations" description="Quotes linked to customers and installations." actionLabel="New Quotation" onAction={openNew} />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm"><p className="text-xs text-muted-foreground">Total Quotations</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm"><p className="text-xs text-muted-foreground">Accepted</p><p className="text-2xl font-bold mt-1 text-emerald-600">{items.filter((q) => q.status === "Accepted").length}</p></div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm"><p className="text-xs text-muted-foreground">Total Value</p><p className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</p></div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Quotation #</th>
                  <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Customer</th>
                  <th className="text-left font-medium px-4 py-3 hidden lg:table-cell">Installation</th>
                  <th className="text-left font-medium px-4 py-3">Value</th>
                  <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((q) => (
                  <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{q.quotationNumber}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{customerName(q.customerId)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{instSerial(q.installationId)}</td>
                    <td className="px-4 py-3 font-semibold">${Number(q.totalValue || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{q.date || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge value={q.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(q)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(q.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No quotations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Quotation" : "New Quotation"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Quotation # *</Label><Input value={form.quotationNumber} onChange={(e) => set("quotationNumber", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Total Value</Label><Input type="number" value={form.totalValue} onChange={(e) => set("totalValue", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => set("customerId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Installation</Label>
                <Select value={form.installationId} onValueChange={(v) => set("installationId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{installs.map((i) => <SelectItem key={i.id} value={i.id}>{i.serialNumber}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.quotationNumber}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}