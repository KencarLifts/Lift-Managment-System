import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/StatusBadge";
import { Building2, MapPin } from "lucide-react";

const STATUS_COLOR = {
  Planned: "#94a3b8",
  "In Progress": "#3b82f6",
  Active: "#10b981",
  Maintenance: "#f59e0b",
  "Out of Service": "#ef4444",
};

function makeIcon(status) {
  const color = STATUS_COLOR[status] || "#3b82f6";
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ${color}40,0 2px 6px rgba(0,0,0,.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function MapView() {
  const [installs, setInstalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Installation.list().then(setInstalls).finally(() => setLoading(false));
  }, []);

  const geo = installs.filter((i) => i.gpsLat && i.gpsLng);
  const center = geo[0] ? [geo[0].gpsLat, geo[0].gpsLng] : [42.6977, 23.3219]; // Sofia default

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time location of all installations with GPS coordinates.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_COLOR).map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-full" style={{ background: c }} />
            {s}
          </div>
        ))}
      </div>

      {geo.length === 0 ? (
        <div className="bg-card rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No installations have GPS coordinates yet. Add GPS lat/lng to an installation to see it here.</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: "70vh" }}>
          <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {geo.map((i) => (
              <Marker key={i.id} position={[i.gpsLat, i.gpsLng]} icon={makeIcon(i.status)}>
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span className="font-semibold">{i.serialNumber}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{i.address || "No address"}</p>
                    <p className="text-xs mb-2">Status: <span className="font-medium">{i.status}</span></p>
                    {i.googleMapsUrl && (
                      <a href={i.googleMapsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600">Open in Google Maps →</a>
                    )}
                    <Link to={`/installations/${i.id}`} className="block text-xs text-blue-600 mt-1">View details →</Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {geo.slice(0, 6).map((i) => (
          <Link key={i.id} to={`/installations/${i.id}`} className="bg-card rounded-lg border border-border p-3 hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: STATUS_COLOR[i.status] }} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{i.serialNumber}</p>
              <p className="text-xs text-muted-foreground truncate">{i.address || "No address"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}