import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatusBadge from "@/components/StatusBadge";
import ServiceLogForm from "@/components/ServiceLogForm";
import { Image } from "@/components/ui/image";
import { INSTALLATION_GROUPS } from "@/lib/installationFields";
import {
  ArrowLeft, MapPin, Wrench, Upload, FileText,
} from "lucide-react";

function FieldValue({ field, value, customerName }) {
  let display = value;
  if (field.type === "customer") display = customerName || "—";
  else if (field.type === "boolean") display = value ? "Yes" : "No";
  else if (value === null || value === undefined || value === "") display = "—";
  else if (field.unit) display = `${value} ${field.unit}`;
  return (
    <div className="py-1.5">
      <p className="text-xs text-muted-foreground">{field.label}</p>
      <p className="text-sm font-medium text-foreground break-words">{display}</p>
    </div>
  );
}

export default function InstallationDetail() {
  const { id } = useParams();
  const [inst, setInst] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [logOpen, setLogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const load = async () => {
    const [i, techs, allLogs] = await Promise.all([
      base44.entities.Installation.get(id),
      base44.entities.Technician.list(),
      base44.entities.ServiceLog.filter({ installationId: id }, "-date", 100),
    ]);
    setInst(i);
    setTechnicians(techs);
    setLogs(allLogs);
    setPhotoUrl(i.photoUrl || "");
    if (i.customerId) {
      try { setCustomer(await base44.entities.Customer.get(i.customerId)); } catch { setCustomer(null); }
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Installation.update(id, { photoUrl: file_url });
      setPhotoUrl(file_url);
    } finally {
      setUploading(false);
    }
  };

  const techName = (tid) => technicians.find((t) => t.id === tid)?.name || "—";
  const customerName = customer?.companyName;

  if (!inst) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto">
      <Link to="/installations" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to installations
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{inst.factoryNo || "—"}</h1>
            {inst.elevatorCode && <span className="text-sm text-muted-foreground">({inst.elevatorCode})</span>}
            <StatusBadge value={inst.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {inst.address || inst.location || "No address"}
          </p>
        </div>
        <Button onClick={() => setLogOpen(true)}>
          <Wrench className="w-4 h-4 mr-1.5" /> Log Service
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="service">Service History ({logs.length})</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-5">
            {INSTALLATION_GROUPS.map((group) => (
              <div key={group.name} className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <h3 className="font-semibold mb-3">{group.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-1 divide-y divide-border sm:divide-y-0">
                  {group.fields.map((field) => (
                    <FieldValue key={field.key} field={field} value={inst[field.key]} customerName={customerName} />
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(inst.dynamicParameters || {}).length > 0 && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <h3 className="font-semibold mb-3">Custom Parameters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(inst.dynamicParameters).map(([k, v]) => (
                    <div key={k} className="bg-muted/50 rounded-lg px-3 py-2">
                      <p className="text-xs text-muted-foreground">{k}</p>
                      <p className="text-sm font-medium">{String(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inst.notes && (
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{inst.notes}</p>
              </div>
            )}

            {inst.googleMapsUrl && (
              <a href={inst.googleMapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            )}
          </div>
        </TabsContent>

        <TabsContent value="service">
          <div className="bg-card rounded-xl border border-border shadow-sm">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No service history yet.</p>
                <Button variant="outline" className="mt-3" onClick={() => setLogOpen(true)}>
                  <Wrench className="w-4 h-4 mr-1.5" /> Add first entry
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge value={log.type} />
                        <span className="text-sm font-medium">{techName(log.technicianId)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.date}</span>
                    </div>
                    {log.description && <p className="text-sm mt-1">{log.description}</p>}
                    {log.partsUsed && <p className="text-xs text-muted-foreground mt-1">Parts: {log.partsUsed}</p>}
                    {log.notes && <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Installation Photo</h3>
              <label className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline cursor-pointer">
                <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload photo"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
            {photoUrl ? (
              <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                <Image src={photoUrl} fittingType="fill" className="w-full h-full" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No photo uploaded yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ServiceLogForm
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onSaved={load}
        installationId={id}
        technicians={technicians}
      />
    </div>
  );
}