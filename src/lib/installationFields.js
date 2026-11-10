// Shared field configuration for the Installation entity, grouped per the
// restructured schema. Drives both the form (inputs) and the detail view (read-only).

export const INSTALLATION_GROUPS = [
  {
    name: "Identification & Location",
    fields: [
      { key: "factoryNo", label: "Factory NO", type: "text", required: true },
      { key: "elevatorCode", label: "Elevator Code", type: "text" },
      { key: "address", label: "Address", type: "text" },
      { key: "gpsLng", label: "GPS longitude", type: "number" },
      { key: "gpsLat", label: "GPS latitude", type: "number" },
      { key: "location", label: "Location", type: "text" },
      { key: "inUseYear", label: "In used year", type: "number" },
      { key: "elevatorModel", label: "Elevator model", type: "text" },
      { key: "elevatorType", label: "Elevator type", type: "select", options: ["Passenger", "Freight", "Hospital", "Service", "Panoramic", "Home"], default: "Passenger" },
      { key: "floors", label: "Floor", type: "number" },
      { key: "stations", label: "Station", type: "number" },
      { key: "iotCode", label: "IoT code", type: "text" },
      { key: "remoteCall", label: "Remote call", type: "boolean", default: false },
      { key: "status", label: "Elevator Status", type: "select", required: true, options: ["Planned", "In Progress", "Active", "Maintenance", "Out of Service"], default: "Planned" },
    ],
  },
  {
    name: "Technical parameters",
    fields: [
      { key: "ratedLoadKg", label: "Rated load", type: "number", unit: "kg" },
      { key: "ratedSpeedMs", label: "Rated speed", type: "number", unit: "m/s" },
      { key: "shaftWidthMm", label: "Shaft width", type: "number", unit: "mm" },
      { key: "shaftDepthMm", label: "Shaft depth", type: "number", unit: "mm" },
      { key: "cabinWidthMm", label: "Cabin width", type: "number", unit: "mm" },
      { key: "cabinDepthMm", label: "Cabin depth", type: "number", unit: "mm" },
      { key: "pitDepthMm", label: "Pit depth", type: "number", unit: "mm" },
      { key: "overheadMm", label: "Overhead", type: "number", unit: "mm" },
      { key: "travelDistanceM", label: "Travel distance", type: "number", unit: "m" },
      { key: "ratedPowerKw", label: "Rated power", type: "number", unit: "kW" },
      { key: "doorWidthMm", label: "Door width", type: "number", unit: "mm" },
    ],
  },
  {
    name: "Certification & Inspection",
    fields: [
      { key: "certificateDate", label: "Elevator certificate date", type: "date" },
      { key: "certificateNumber", label: "Certificate number", type: "text" },
      { key: "inspectionOrganization", label: "Inspection organization", type: "text" },
      { key: "useType", label: "Use type", type: "text" },
      { key: "lastAnnualInspectionDate", label: "Last annual inspection date", type: "date" },
      { key: "nextAnnualInspectionDate", label: "Next annual inspection date", type: "date" },
    ],
  },
  {
    name: "Manufacturing & Order & Installation",
    fields: [
      { key: "manufacturerName", label: "Manufacturer name", type: "text" },
      { key: "quotationNumber", label: "Quotation number", type: "text" },
      { key: "contractNumber", label: "Contract number", type: "text" },
      { key: "orderDate", label: "Order date", type: "date" },
      { key: "productionScheduleTime", label: "Production schedule time", type: "date" },
      { key: "installationScheduleTime", label: "Schedule installation time", type: "date" },
      { key: "installationEndDate", label: "Installation end date", type: "date" },
      { key: "commissioningDate", label: "Commissioning date", type: "date" },
      { key: "handoverDate", label: "Handover date", type: "date" },
    ],
  },
  {
    name: "Maintenance & Property",
    fields: [
      { key: "firstUpkeepDate", label: "First upkeep date", type: "date" },
      { key: "propertyContact", label: "Property contact", type: "text" },
      { key: "lastMaintenanceContractDate", label: "Last maintenance contract date", type: "date" },
      { key: "servicesPerYear", label: "Services per year", type: "number" },
      { key: "customerId", label: "Customer", type: "customer" },
    ],
  },
  {
    name: "Audit",
    fields: [
      { key: "lastUpdatePerson", label: "LastUpdatePerson", type: "text", audit: true },
      { key: "lastUpdateTime", label: "LastUpdateTime", type: "date", audit: true },
    ],
  },
];

// Non-grouped extras kept on the entity.
export const INSTALLATION_EXTRAS = [
  { key: "googleMapsUrl", label: "Google Maps URL", type: "text" },
  { key: "photoUrl", label: "Photo URL", type: "text" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const NUMBER_KEYS = new Set(
  INSTALLATION_GROUPS.flatMap((g) => g.fields).filter((f) => f.type === "number").map((f) => f.key)
);

export function emptyInstallation() {
  const obj = {};
  INSTALLATION_GROUPS.forEach((g) => {
    g.fields.forEach((f) => {
      obj[f.key] = f.default !== undefined ? f.default : (f.type === "boolean" ? false : "");
    });
  });
  INSTALLATION_EXTRAS.forEach((f) => { obj[f.key] = ""; });
  obj.dynamicParameters = {};
  return obj;
}