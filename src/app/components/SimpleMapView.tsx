import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet.css";
import { MPA } from "../data/mockData";
import { buildMpaPopupHtml } from "../lib/mpaPopupHtml";
import { Button } from "./ui/button";
import { useMpa } from "../contexts/MpaContext";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getRings(mpa: MPA): [number, number][][] {
  if (mpa.multiPolygonRings && mpa.multiPolygonRings.length > 0) {
    return mpa.multiPolygonRings;
  }
  return [mpa.coordinates];
}

export function SimpleMapView() {
  const { activeMpas } = useMpa();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.LayerGroup | null>(null);
  const streetRef = useRef<L.TileLayer | null>(null);
  const satelliteRef = useRef<L.TileLayer | null>(null);
  const [baseMap, setBaseMap] = useState<"street" | "satellite">("street");

  const getMpaColor = (type: MPA["type"]): string => {
    switch (type) {
      case "core":
        return "#0ea5e9";
      case "buffer":
        return "#14b8a6";
      case "multiple-use":
        return "#22c55e";
      case "fishery-reserve":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 100,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelDebounceTime: 45,
      worldCopyJump: false,
      minZoom: 3,
    }).setView([9.74, 118.74], 11);

    const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true,
    });
    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri", noWrap: true },
    );

    street.addTo(map);
    streetRef.current = street;
    satelliteRef.current = satellite;

    polygonLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      streetRef.current = null;
      satelliteRef.current = null;
      polygonLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layerGroup = polygonLayerRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    activeMpas.forEach((mpa) => {
      const color = getMpaColor(mpa.type);
      getRings(mpa).forEach((ring) => {
        if (ring.length < 3) return;
        const polygon = L.polygon(ring, {
          color,
          fillColor: color,
          fillOpacity: 0.4,
          weight: 2,
        });
        polygon.bindPopup(buildMpaPopupHtml(mpa), { maxWidth: 320 });
        polygon.addTo(layerGroup);
      });
    });
  }, [activeMpas]);

  useEffect(() => {
    const map = mapRef.current;
    const street = streetRef.current;
    const satellite = satelliteRef.current;
    if (!map || !street || !satellite) return;
    if (baseMap === "satellite") {
      if (map.hasLayer(street)) map.removeLayer(street);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (!map.hasLayer(street)) street.addTo(map);
    }
  }, [baseMap]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainerRef} className="h-full w-full" />

      <div className="absolute top-4 left-14 z-[1000] flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={baseMap === "street" ? "default" : "outline"}
          className={baseMap === "street" ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "bg-white/95 shadow-md"}
          onClick={() => setBaseMap("street")}
        >
          Street
        </Button>
        <Button
          type="button"
          size="sm"
          variant={baseMap === "satellite" ? "default" : "outline"}
          className={baseMap === "satellite" ? "bg-blue-600 hover:bg-blue-700 shadow-md" : "bg-white/95 shadow-md"}
          onClick={() => setBaseMap("satellite")}
        >
          Satellite
        </Button>
      </div>

      <div className="absolute bottom-6 left-6 z-[1000] max-w-[220px] bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
        <h4 className="font-semibold mb-3 text-sm">MPA Types</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#0ea5e9" }} />
            <span className="text-xs">Core Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#14b8a6" }} />
            <span className="text-xs">Buffer Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#22c55e" }} />
            <span className="text-xs">Multiple Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#eab308" }} />
            <span className="text-xs">Fishery Reserve</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-3 leading-snug">
          Tap a blue area for ordinance, habitat, and status details.
        </p>
      </div>
    </div>
  );
}
