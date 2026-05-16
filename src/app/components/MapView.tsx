import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import proj4 from "proj4";
import "leaflet/dist/leaflet.css";
import "../../styles/leaflet.css";
import { MPA } from "../data/mockData";
import { Button } from "./ui/button";
import { Ruler, X, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CoordinateSystem } from "./OrdinancePolygonTool";
import { buildMpaPopupHtml } from "../lib/mpaPopupHtml";

function getMpaRings(mpa: MPA): [number, number][][] {
  if (mpa.multiPolygonRings && mpa.multiPolygonRings.length > 0) {
    return mpa.multiPolygonRings;
  }
  return [mpa.coordinates];
}

type BaseMapStyle = "street" | "satellite";
const wgs84 = "EPSG:4326";
const prs92 = "EPSG:4683";
const utm51n = "EPSG:32651";
proj4.defs("EPSG:4683", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
proj4.defs("EPSG:32651", "+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs +type=crs");

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  mpas: MPA[];
  selectedMpa: string | null;
  onSelectMpa: (id: string) => void;
  drawingMode: boolean;
  onDrawComplete?: (coordinates: [number, number][]) => void;
  geometryEditMode?: boolean;
  onGeometryChange?: (coords: [number, number][]) => void;
  coordinateSystem: CoordinateSystem;
  onCoordinateSystemChange: (value: CoordinateSystem) => void;
  baseMapStyle: BaseMapStyle;
  onBaseMapStyleChange: (value: BaseMapStyle) => void;
}

interface MeasurementPoint {
  latlng: L.LatLng;
  marker: L.Marker;
}

export function MapView({
  mpas,
  selectedMpa,
  onSelectMpa,
  drawingMode,
  onDrawComplete,
  geometryEditMode,
  onGeometryChange,
  coordinateSystem,
  onCoordinateSystemChange,
  baseMapStyle,
  onBaseMapStyleChange,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mpaLayersRef = useRef<Map<string, L.LayerGroup>>(new Map());
  const drawingLayerRef = useRef<L.Polygon | null>(null);
  const pointsRef = useRef<L.LatLng[]>([]);
  const tempMarkersRef = useRef<L.Marker[]>([]);
  const editableLayerRef = useRef<L.Polygon | null>(null);

  // Measuring tool state
  const [measuringMode, setMeasuringMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<
    MeasurementPoint[]
  >([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const measureLinesRef = useRef<L.Polyline[]>([]);
  const measureMarkersRef = useRef<L.Marker[]>([]);
  const baseStreetLayerRef = useRef<L.TileLayer | null>(null);
  const baseSatelliteLayerRef = useRef<L.TileLayer | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const normalizeClosedPolygon = (
    coords: [number, number][],
  ): [number, number][] => {
    if (coords.length < 3) return coords;
    const first = coords[0];
    const last = coords[coords.length - 1];
    const isClosed =
      first[0] === last[0] && first[1] === last[1];
    return isClosed ? [...coords] : [...coords, first];
  };

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

  const formatPointForDisplay = (lat: number, lng: number) => {
    if (coordinateSystem === "UTM51N") {
      const [x, y] = proj4(wgs84, utm51n, [lng, lat]);
      return `UTM 51N: ${x.toFixed(2)}, ${y.toFixed(2)}`;
    }
    if (coordinateSystem === "PRS92") {
      const [x, y] = proj4(wgs84, prs92, [lng, lat]);
      return `PRS92: ${y.toFixed(6)}, ${x.toFixed(6)}`;
    }
    return `WGS84: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Initialize map
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
    }).setView(
      [9.74, 118.74],
      11,
    );

    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        noWrap: true,
      },
    );
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri", noWrap: true },
    );

    streetLayer.addTo(map);
    baseStreetLayerRef.current = streetLayer;
    baseSatelliteLayerRef.current = satelliteLayer;

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (drawingMode || measuringMode) return;
      if (clickMarkerRef.current) {
        map.removeLayer(clickMarkerRef.current);
      }
      clickMarkerRef.current = L.marker(e.latlng)
        .addTo(map)
        .bindPopup(formatPointForDisplay(e.latlng.lat, e.latlng.lng))
        .openPopup();
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [coordinateSystem, drawingMode, measuringMode]);

  useEffect(() => {
    const map = mapRef.current;
    const streetLayer = baseStreetLayerRef.current;
    const satelliteLayer = baseSatelliteLayerRef.current;
    if (!map || !streetLayer || !satelliteLayer) return;

    if (baseMapStyle === "satellite") {
      if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
      if (!map.hasLayer(satelliteLayer)) satelliteLayer.addTo(map);
    } else {
      if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
      if (!map.hasLayer(streetLayer)) streetLayer.addTo(map);
    }
  }, [baseMapStyle]);

  // Update MPA layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old layers
    mpaLayersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    mpaLayersRef.current.clear();

    // Add new layers (one LayerGroup per MPA; multiple polygons for multi-area MPAs)
    mpas.forEach((mpa) => {
      const color = getMpaColor(mpa.type);
      const isSelected = selectedMpa === mpa.id;
      const isDraft =
        mpa.status === "pending" || mpa.status === "review";
      const rings = getMpaRings(mpa);
      const group = L.layerGroup();

      rings.forEach((ring) => {
        const polygon = L.polygon(ring, {
          color: isDraft ? "#f59e0b" : color,
          fillColor: isDraft ? "#fbbf24" : color,
          fillOpacity: isSelected ? 0.6 : isDraft ? 0.35 : 0.4,
          weight: isSelected ? 4 : 2,
          dashArray: isDraft ? "8, 6" : undefined,
        });
        polygon.on("click", () => {
          onSelectMpa(mpa.id);
        });
        polygon.bindPopup(buildMpaPopupHtml(mpa), { maxWidth: 320 });
        group.addLayer(polygon);
      });

      group.addTo(map);
      mpaLayersRef.current.set(mpa.id, group);
    });
  }, [mpas, selectedMpa, onSelectMpa]);

  // Handle drawing mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!drawingMode) {
      // Clean up when drawing mode is disabled
      if (drawingLayerRef.current) {
        map.removeLayer(drawingLayerRef.current);
        drawingLayerRef.current = null;
      }
      tempMarkersRef.current.forEach((marker) =>
        map.removeLayer(marker),
      );
      tempMarkersRef.current = [];
      pointsRef.current = [];
      return;
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const point = e.latlng;
      pointsRef.current.push(point);

      // Add marker for the point
      const marker = L.marker(point).addTo(map);
      tempMarkersRef.current.push(marker);

      // Update or create polygon
      if (pointsRef.current.length >= 2) {
        if (drawingLayerRef.current) {
          map.removeLayer(drawingLayerRef.current);
        }
        drawingLayerRef.current = L.polygon(pointsRef.current, {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.3,
          weight: 3,
        }).addTo(map);
      }
    };

    const completeDrawing = () => {
      if (pointsRef.current.length >= 3 && onDrawComplete) {
        const coordinates: [number, number][] =
          pointsRef.current.map((point) => [
            point.lat,
            point.lng,
          ]);
        onDrawComplete(normalizeClosedPolygon(coordinates));

        if (drawingLayerRef.current) {
          map.removeLayer(drawingLayerRef.current);
          drawingLayerRef.current = null;
        }
        tempMarkersRef.current.forEach((marker) =>
          map.removeLayer(marker),
        );
        tempMarkersRef.current = [];
        pointsRef.current = [];
      }
    };

    const handleDblClick = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);
      completeDrawing();
    };

    const handleContextMenu = (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);
      completeDrawing();
    };

    map.on("click", handleMapClick);
    map.on("dblclick", handleDblClick);
    map.on("contextmenu", handleContextMenu);

    return () => {
      map.off("click", handleMapClick);
      map.off("dblclick", handleDblClick);
      map.off("contextmenu", handleContextMenu);
    };
  }, [drawingMode, onDrawComplete]);

  // Handle measuring mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!measuringMode) {
      // Clean up when measuring mode is disabled
      measureLinesRef.current.forEach((line) =>
        map.removeLayer(line),
      );
      measureLinesRef.current = [];
      measureMarkersRef.current.forEach((marker) =>
        map.removeLayer(marker),
      );
      measureMarkersRef.current = [];
      setMeasurementPoints([]);
      setTotalDistance(0);
      return;
    }

    const handleMeasureClick = (e: L.LeafletMouseEvent) => {
      const point = e.latlng;

      setMeasurementPoints((prevPoints) => {
        // Create custom numbered icon for measurement markers
        const markerNumber = prevPoints.length + 1;
        const icon = L.divIcon({
          className: "custom-measure-marker",
          html: `<div style="background-color: #3b82f6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${markerNumber}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(point, { icon }).addTo(map);
        measureMarkersRef.current.push(marker);

        const newPoints = [
          ...prevPoints,
          { latlng: point, marker },
        ];

        if (newPoints.length > 1) {
          const lastPoint =
            newPoints[newPoints.length - 2].latlng;
          const currentPoint = point;

          // Draw line between points
          const line = L.polyline([lastPoint, currentPoint], {
            color: "#3b82f6",
            weight: 3,
            dashArray: "10, 5",
          }).addTo(map);
          measureLinesRef.current.push(line);

          // Calculate segment distance
          const segmentDistance =
            lastPoint.distanceTo(currentPoint);

          // Add distance label at midpoint
          const midLat = (lastPoint.lat + currentPoint.lat) / 2;
          const midLng = (lastPoint.lng + currentPoint.lng) / 2;

          const distanceLabel = L.marker([midLat, midLng], {
            icon: L.divIcon({
              className: "distance-label",
              html: `<div style="background-color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid #3b82f6; white-space: nowrap;">${(segmentDistance / 1000).toFixed(2)} km</div>`,
              iconSize: [0, 0],
            }),
          }).addTo(map);
          measureMarkersRef.current.push(distanceLabel);

          setTotalDistance(
            (prevDistance) => prevDistance + segmentDistance,
          );
        }

        return newPoints;
      });
    };

    map.on("click", handleMeasureClick);

    return () => {
      map.off("click", handleMeasureClick);
    };
  }, [measuringMode]);

  // Handle geometry edit mode (EDIT EXISTING MPA)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // cleanup
    if (editableLayerRef.current) {
      map.removeLayer(editableLayerRef.current);
      editableLayerRef.current = null;
    }

    if (!geometryEditMode || !selectedMpa) return;

    const mpa = mpas.find((m) => m.id === selectedMpa);
    if (!mpa) return;

    let coords: [number, number][] = [...mpa.coordinates];
    const isClosed =
      coords.length > 2 &&
      coords[0][0] === coords[coords.length - 1][0] &&
      coords[0][1] === coords[coords.length - 1][1];
    if (isClosed) {
      coords = coords.slice(0, -1);
    }

    const polygon = L.polygon(coords, {
      color: "#6366f1",
      weight: 3,
      fillOpacity: 0.3,
    }).addTo(map);

    editableLayerRef.current = polygon;

    const markers: L.Marker[] = [];

    coords.forEach((_, index) => {
      const marker = L.marker(coords[index], {
        draggable: true,
        icon: L.divIcon({
          className: "vertex-marker",
          html: `<div style="
          width:12px;
          height:12px;
          background:#6366f1;
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 0 6px rgba(0,0,0,0.4);
          cursor:grab;
        "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        }),
      }).addTo(map);

      // 🔥 THIS is true drag behavior
      marker.on("dragstart", () => {
        map.dragging.disable();
      });

      marker.on("drag", (e: L.LeafletEvent) => {
        const pos = (e.target as L.Marker).getLatLng();

        coords[index] = [pos.lat, pos.lng];

        polygon.setLatLngs(normalizeClosedPolygon(coords));
      });

      marker.on("dragend", () => {
        map.dragging.enable();
        onGeometryChange?.(normalizeClosedPolygon(coords));
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => map.removeLayer(m));

      if (editableLayerRef.current) {
        map.removeLayer(editableLayerRef.current);
        editableLayerRef.current = null;
      }
    };
  }, [geometryEditMode, selectedMpa, mpas, onGeometryChange]);
  const clearMeasurements = () => {
    const map = mapRef.current;
    if (!map) return;

    measureLinesRef.current.forEach((line) =>
      map.removeLayer(line),
    );
    measureLinesRef.current = [];
    measureMarkersRef.current.forEach((marker) =>
      map.removeLayer(marker),
    );
    measureMarkersRef.current = [];
    setMeasurementPoints([]);
    setTotalDistance(0);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div
        ref={mapContainerRef}
        className="w-full h-full z-0"
      />

      {/* Map Legend */}
      <div className="absolute bottom-6 right-6 z-10 bg-white p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-3 text-sm">
          MPA Types
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#0ea5e9" }}
            ></div>
            <span className="text-xs">Core Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#14b8a6" }}
            ></div>
            <span className="text-xs">Buffer Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#22c55e" }}
            ></div>
            <span className="text-xs">Multiple Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: "#eab308" }}
            ></div>
            <span className="text-xs">Fishery Reserve</span>
          </div>
        </div>
      </div>

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">
            🖊️ Drawing Mode Active - Click to add points,
            double-click or right-click to finish
          </p>
        </div>
      )}

      {/* Measuring Tool Controls */}
      {!drawingMode && (
        <div className="absolute top-6 left-16 z-10 flex items-center gap-2">
          <Select
            value={coordinateSystem}
            onValueChange={(value) =>
              onCoordinateSystemChange(value as CoordinateSystem)
            }
          >
            <SelectTrigger className="w-[160px] bg-white shadow-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WGS84">WGS84</SelectItem>
              <SelectItem value="PRS92">PRS92</SelectItem>
              <SelectItem value="UTM51N">UTM Zone 51N</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={baseMapStyle}
            onValueChange={(value) =>
              onBaseMapStyleChange(value as BaseMapStyle)
            }
          >
            <SelectTrigger className="w-[130px] bg-white shadow-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street">Street</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setMeasuringMode(!measuringMode)}
            className={`shadow-lg ${
              measuringMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            }`}
          >
            <Ruler className="w-4 h-4 mr-2" />
            {measuringMode
              ? "Measuring..."
              : "Measure Distance"}
          </Button>
        </div>
      )}

      {/* Measuring Results Panel */}
      {measuringMode && (
        <div className="absolute top-20 left-16 z-10 bg-white p-4 rounded-lg shadow-lg min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">
              Distance Measurement
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMeasuringMode(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">
                Total Distance
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {(totalDistance / 1000).toFixed(3)} km
              </p>
              <p className="text-sm text-gray-500">
                {totalDistance.toFixed(2)} meters
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">
                Points Marked
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {measurementPoints.length}{" "}
                {measurementPoints.length === 1
                  ? "point"
                  : "points"}
              </p>
              {measurementPoints.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {measurementPoints.length - 1}{" "}
                  {measurementPoints.length - 1 === 1
                    ? "segment"
                    : "segments"}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearMeasurements}
                disabled={measurementPoints.length === 0}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                💡 Click on the map to add measurement points
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}