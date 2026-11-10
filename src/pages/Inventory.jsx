import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package, AlertTriangle, Minus } from "lucide-react";

const empty = { name: "", catalogNumber: "", quantity: 0, minQuantity: 0 };

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [lowOnly, setLowOnly] = useState(false);

  const load = async () => { setItems(await base44.entities.Part.list()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...empty, ...p }); setOpen(true); };

  const save = async () => {
    if (!form.name) return;
    const payload = { ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity) };
    if (editing) await base44.entities.Part.update(editing.id, payload);
    else await base44.entities.Part.create(payload);
    setOpen(false); load();
  };

  const remove = async (id) => { if (!confirm("Delete this part?")) return; await base44.entities.Part.delete(id); load(); };

  const adjust = async (p, delta) => {
    const q = Math.max(0, (p.quantity || 0) + delta);
    await base44.entities.Part.update(p.id, { quantity: q });
    load();
  };

  const isLow = (p) => p.quantity <= p.minQuantity;
  const shown = lowOnly ? items.filter(isLow) : items;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Parts Inventory" description="Live stock counter with low-stock alerts." actionLabel="Add Part" onAction={openNew} />

      <div className="flex gap-2 mb-5">
        <button onClick={() => setLowOnly(false)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!lowOnly ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>All ({items.length})</button>
        <button onClick={() => setLowOnly(true)} className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 ${lowOnly ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({items.filter(isLow).length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((p) => (
            <div key={p.id} className={`bg-card rounded-xl border p-5 shadow-sm ${isLow(p) ? "border-red-200 bg-red-50/30" : "border-border"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLow(p) ? "bg-red-100" : "bg-blue-50"}`}>
                    <Package className={`w-5 h-5 ${isLow(p) ? "text-red-600" : "text-blue-600"}`} />
                  </div>
                  <div><h3 className="font-semibold leading-tight">{p.name}</h3><p className="text-xs text-muted-foreground">{p.catalogNumber || "No catalog #"}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => adjust(p, -1)} className="w-7 h-7 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                  <span className={`text-2xl font-bold tabular-nums w-12 text-center ${isLow(p) ? "text-red-600" : "text-foreground"}`}>{p.quantity}</span>
                  <button onClick={() => adjust(p, 1)} className="w-7 h-7 rounded-md bg-muted hover:bg-muted/70 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Min: {p.minQuantity}</p>
                  {isLow(p) && <span className="text-xs font-medium text-red-600 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Low stock</span>}
                </div>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-12">No parts found.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Part" : "Add Part"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Catalog Number</Label><Input value={form.catalogNumber} onChange={(e) => set("catalogNumber", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Min Quantity</Label><Input type="number" value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}