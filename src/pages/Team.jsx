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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Phone, User } from "lucide-react";

const ROLES = ["Installer", "Service Tech", "Electrician", "Team Lead"];
const empty = { name: "", phone: "", role: "Installer", active: true };

export default function Team() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => { setItems(await base44.entities.Technician.list()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...empty, ...t }); setOpen(true); };

  const save = async () => {
    if (!form.name) return;
    if (editing) await base44.entities.Technician.update(editing.id, form);
    else await base44.entities.Technician.create(form);
    setOpen(false); load();
  };

  const remove = async (id) => { if (!confirm("Remove this team member?")) return; await base44.entities.Technician.delete(id); load(); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Team" description="Directory of engineers and installers assignable to field tasks." actionLabel="Add Member" onAction={openNew} />

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Phone</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.role}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {t.phone && <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{t.phone}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {t.active ? <StatusBadge value="Active" /> : <StatusBadge value="Out of Service" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(t)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(t.id)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No team members yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Member" : "Add Team Member"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="rounded" />
              <Label htmlFor="active" className="text-sm">Active</Label>
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