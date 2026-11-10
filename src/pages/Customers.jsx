import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/PageHeader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Phone, Mail, Building } from "lucide-react";

const empty = { companyName: "", contactPerson: "", phone: "", email: "", address: "" };

export default function Customers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => { setItems(await base44.entities.Customer.list("-created_date", 200)); setLoading(false); };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...empty, ...c }); setOpen(true); };

  const save = async () => {
    if (!form.companyName) return;
    if (editing) await base44.entities.Customer.update(editing.id, form);
    else await base44.entities.Customer.create(form);
    setOpen(false); load();
  };

  const remove = async (id) => { if (!confirm("Delete this customer?")) return; await base44.entities.Customer.delete(id); load(); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Customers" description="Corporate accounts linked to your installations." actionLabel="New Customer" onAction={openNew} />

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Building className="w-5 h-5 text-blue-600" /></div>
                  <div><h3 className="font-semibold leading-tight">{c.companyName}</h3><p className="text-xs text-muted-foreground">{c.contactPerson || "—"}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                {c.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" />{c.phone}</p>}
                {c.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4" />{c.email}</p>}
              </div>
              {c.address && <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">{c.address}</p>}
            </div>
          ))}
          {items.length === 0 && <p className="text-muted-foreground text-sm col-span-full text-center py-12">No customers yet.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Company Name *</Label><Input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Contact Person</Label><Input value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Address</Label><Textarea value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.companyName}>{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}