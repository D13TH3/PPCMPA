import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MPA } from "../data/mockData";

function getRings(mpa: MPA): [number, number][][] {
  if (mpa.multiPolygonRings && mpa.multiPolygonRings.length > 0) {
    return mpa.multiPolygonRings;
  }
  return [mpa.coordinates];
}

interface MpaPolygonPreviewProps {
  mpa: MPA;
  className?: string;
  height?: number;
}

export function MpaPolygonPreview({
  mpa,
  className = "",
  height = 200,
}: MpaPolygonPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    const color = "#0ea5e9";
    const layers: L.Polygon[] = [];

    getRings(mpa).forEach((ring) => {
      if (ring.length < 3) return;
      const polygon = L.polygon(ring, {
        color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 2,
      }).addTo(map);
      layers.push(polygon);
    });

    if (layers.length > 0) {
      const group = L.featureGroup(layers);
      map.fitBounds(group.getBounds().pad(0.2));
    } else {
      map.setView([9.74, 118.74], 11);
    }

    return () => {
      map.remove();
    };
  }, [mpa]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg border border-gray-200 overflow-hidden bg-gray-100 ${className}`}
      style={{ height }}
      aria-label={`Map preview of ${mpa.name}`}
    />
  );
}

