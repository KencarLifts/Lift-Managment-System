import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
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

const TYPES = ["Maintenance", "Repair", "Emergency", "Inspection", "Part Replacement"];

const empty = { type: "Maintenance", description: "", technicianId: "", date: "", partsUsed: "", notes: "" };

export default function ServiceLogForm({ open, onClose, onSaved, installationId, technicians = [] }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.date || !form.type) return;
    setSaving(true);
    try {
      await base44.entities.ServiceLog.create({ ...form, installationId });
      setForm(empty);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Service Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assigned Technician</Label>
            <Select value={form.technicianId} onValueChange={(v) => set("technicianId", v)}>
              <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
              <SelectContent>
                {technicians.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Parts Used</Label>
            <Input value={form.partsUsed} onChange={(e) => set("partsUsed", e.target.value)} placeholder="e.g. Control board x1, cables x4" />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.date}>Save Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}