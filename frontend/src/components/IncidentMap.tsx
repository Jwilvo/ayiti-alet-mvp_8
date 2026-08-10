import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
}

interface Props {
  center: [number, number];
  zoom?: number;
  height?: number;
  markers?: MapMarker[];
  onPickLocation?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  plenEkran?: boolean;
}

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function IncidentMap({
  center,
  zoom = 13,
  height = 220,
  markers = [],
  onPickLocation,
  pickedLocation,
  plenEkran = false,
}: Props) {
  const kadStil = plenEkran
    ? { height: "100%", width: "100%" }
    : { height, borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", marginBottom: 14 };

  return (
    <div style={kadStil}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#142138" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {markers.map((m) => (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={9}
            pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.85, weight: 2 }}
            eventHandlers={m.onClick ? { click: m.onClick } : undefined}
          >
            <Popup>
              <strong>{m.label}</strong>
              {m.sublabel && <div style={{ fontSize: 12 }}>{m.sublabel}</div>}
            </Popup>
          </CircleMarker>
        ))}
        {pickedLocation && (
          <CircleMarker
            center={[pickedLocation.lat, pickedLocation.lng]}
            radius={10}
            pathOptions={{ color: "#5b7fd6", fillColor: "#5b7fd6", fillOpacity: 0.9, weight: 3 }}
          />
        )}
        {onPickLocation && <ClickCatcher onPick={onPickLocation} />}
      </MapContainer>
    </div>
  );
}
