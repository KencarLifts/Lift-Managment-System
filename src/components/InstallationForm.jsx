import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { INSTALLATION_GROUPS, INSTALLATION_EXTRAS, NUMBER_KEYS, emptyInstallation } from "@/lib/installationFields";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

function FieldInput({ field, value, onChange, customers, disabled }) {
  if (field.type === "customer") {
    return (
      <Select value={value || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
        <SelectContent>
          {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "select") {
    return (
      <Select value={value || field.default || ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {field.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "boolean") {
    return (
      <div className="flex items-center gap-2 h-9">
        <Switch checked={!!value} onCheckedChange={onChange} disabled={disabled} />
        <span className="text-sm text-muted-foreground">{value ? "Yes" : "No"}</span>
      </div>
    );
  }
  if (field.type === "textarea") {
    return <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={2} disabled={disabled} />;
  }
  return (
    <Input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      step={field.type === "number" ? "any" : undefined}
      value={value === null || value === undefined ? "" : value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.unit ? `[${field.unit}]` : ""}
      disabled={disabled}
    />
  );
}

export default function InstallationForm({ open, onClose, onSaved, editing, customers = [] }) {
  const [form, setForm] = useState(emptyInstallation);
  const [dynKey, setDynKey] = useState("");
  const [dynVal, setDynVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm({ ...emptyInstallation(), ...editing, dynamicParameters: editing.dynamicParameters || {} });
    } else {
      setForm(emptyInstallation());
      setDynKey(""); setDynVal("");
    }
  }, [editing, open]);

  const isAdmin = me?.role === "admin";
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addParam = () => {
    if (!dynKey.trim()) return;
    setForm((f) => ({ ...f, dynamicParameters: { ...f.dynamicParameters, [dynKey.trim()]: dynVal } }));
    setDynKey(""); setDynVal("");
  };
  const removeParam = (key) => setForm((f) => {
    const next = { ...f.dynamicParameters }; delete next[key];
    return { ...f, dynamicParameters: next };
  });

  const handleSubmit = async () => {
    if (!form.factoryNo) return;
    setSaving(true);
    const payload = { ...form };
    NUMBER_KEYS.forEach((k) => { payload[k] = payload[k] === "" || payload[k] === null ? null : Number(payload[k]); });

    // Audit: auto-fill from current user/time; admins may override
    const autoPerson = me?.full_name || me?.email || "—";
    const autoTime = new Date().toISOString().slice(0, 10);
    payload.lastUpdatePerson = (isAdmin && form.lastUpdatePerson) ? form.lastUpdatePerson : autoPerson;
    payload.lastUpdateTime = (isAdmin && form.lastUpdateTime) ? form.lastUpdateTime : autoTime;

    try {
      if (editing) await base44.entities.Installation.update(editing.id, payload);
      else await base44.entities.Installation.create(payload);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const isAudit = field.audit;
    const disabled = isAudit && !isAdmin;
    return (
      <div className="space-y-1.5" key={field.key}>
        <Label className="flex items-center gap-1">
          {field.label}{field.unit ? ` [${field.unit}]` : ""}
          {field.required && <span className="text-red-500">*</span>}
          {isAudit && <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-normal">auto · admin override</span>}
        </Label>
        <FieldInput
          field={field}
          value={form[field.key]}
          onChange={(v) => set(field.key, v)}
          customers={customers}
          disabled={disabled}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Installation" : "New Installation"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          {INSTALLATION_GROUPS.map((group) => (
            <div key={group.name} className="space-y-3">
              <h4 className="text-sm font-semibold text-primary border-b border-border pb-1.5">{group.name}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.fields.map(renderField)}
              </div>
            </div>
          ))}

          {/* Media & notes extras */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-primary border-b border-border pb-1.5">Media & Notes</h4>
            <div className="grid grid-cols-1 gap-4">
              {INSTALLATION_EXTRAS.map((field) => (
                <div className="space-y-1.5" key={field.key}>
                  <Label>{field.label}</Label>
                  <FieldInput field={field} value={form[field.key]} onChange={(v) => set(field.key, v)} customers={customers} />
                </div>
              ))}
            </div>
          </div>

          {/* Custom parameters (legacy dynamic) */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-primary border-b border-border pb-1.5">Custom Parameters</h4>
            <div className="flex gap-2">
              <Input value={dynKey} onChange={(e) => setDynKey(e.target.value)} placeholder="Parameter name" />
              <Input value={dynVal} onChange={(e) => setDynVal(e.target.value)} placeholder="Value" />
              <Button type="button" variant="secondary" onClick={addParam}><Plus className="w-4 h-4" /></Button>
            </div>
            {Object.entries(form.dynamicParameters).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                <span className="font-medium">{k}:</span>
                <span className="text-muted-foreground flex-1">{String(v)}</span>
                <button onClick={() => removeParam(k)} className="text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !form.factoryNo}>
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Installation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}