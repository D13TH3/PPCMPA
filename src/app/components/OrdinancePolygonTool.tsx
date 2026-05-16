import React, { useCallback, useEffect, useMemo, useState } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import proj4 from "proj4";
import { area as turfArea, kinks, polygon as turfPolygon } from "@turf/turf";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ChevronDown,
  Crosshair,
  FileText,
  GitMerge,
  Layers,
  Layers2,
  MapPin,
  SplitSquareVertical,
} from "lucide-react";
import { toast } from "sonner";

export type CoordinateSystem = "WGS84" | "PRS92" | "UTM51N";

interface ParsedPoint {
  lat: number;
  lng: number;
  source: "decimal" | "dms";
}

/** One named boundary table (e.g. West / East or Section / Zone slice). */
export type OrdinanceCoordinateSection = { name: string; points: ParsedPoint[] };

interface OrdinancePolygonToolProps {
  coordinateSystem: CoordinateSystem;
  /** One or more closed rings [lat,lng]. Multiple rings = one multi-area MPA unless `separateMpas`. */
  onApplyToMap: (payload: {
    rings: [number, number][][];
    suggestedName: string;
    /** Labels from detected ordinance headings (same length as `rings` when set). */
    ringLabels?: string[];
    /** Create one map feature per ring (e.g. "… — West", "… — East") */
    separateMpas?: boolean;
  }) => void;
}

type PolygonSectionMode = "auto" | "all" | "west" | "east" | "north" | "south";

type NamedSectionKey = Exclude<PolygonSectionMode, "auto" | "all">;

type SectionHeadingHit = { idx: number; key: NamedSectionKey };

/** Map polygon slice started by a "Section …" or "Zone …" heading in document order. */
type SectionOrZoneHit = { idx: number; label: string };

const PDFJS_VERSION = pdfjsLib.version || "5.7.284";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;

proj4.defs("EPSG:4683", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
proj4.defs("EPSG:32651", "+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs +type=crs");

const wgs84 = "EPSG:4326";
const prs92 = "EPSG:4683";
const utm51n = "EPSG:32651";

/** Decimal pairs on a single line (no newlines) — only used when the line reads like coordinates. */
const DECIMAL_PAIR_REGEX =
  /(-?\d{1,3}(?:\.\d+)?)\s*[,;\t|]\s*(-?\d{1,3}(?:\.\d+)?)/g;

/**
 * One latitude + one longitude DMS pair on the same line, lat before lng.
 * Requires a degree mark and a minute mark on each side so article/page numbers do not match.
 * Separator between lat and lng is horizontal whitespace / punctuation only (no newlines) so
 * separate ordinance tables are not merged into one match.
 */
const STRICT_DMS_LAT_LNG_PAIR_REGEX =
  /([NS])\s*(\d{1,2})\s*[°°oO0%]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)(?:\s*["″"])?[ \t,;|]{1,48}([EW])\s*(\d{1,3})\s*[°°oO0%]\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)(?:\s*["″"])?/gi;

const UTM_PAIR_REGEX =
  /\b(?:zone\s*)?(51)\s*N?\s*[,:]?\s*(\d{3,7}(?:\.\d+)?)\s*[,;\s]+\s*(\d{6,8}(?:\.\d+)?)\b/gi;

const PALAWAN_LAT_MIN = 7.5;
const PALAWAN_LAT_MAX = 12.8;
const PALAWAN_LNG_MIN = 117.0;
const PALAWAN_LNG_MAX = 120.6;

/** Honda Bay Ord. 390: West longitudes use 118°45′ / 118°47′ columns; East uses 118°46′ (PDF text is often scrambled). */
function isWestStyleLongitudeDmsLine(line: string): boolean {
  const tr = line.trim();
  return (
    /E\s*118\s*[oO0°%]\s*4\s*5\s*'/i.test(tr) ||
    /E\s*118\s*[oO0°%]\s*4\s*7\s*'/i.test(tr) ||
    /E\s*1180\s*4\s*5\s*'/i.test(tr) ||
    /E\s*1180\s*4\s*7\s*'/i.test(tr)
  );
}

function isEastStyleLongitudeDmsLine(line: string): boolean {
  const tr = line.trim();
  return /E\s*118\s*[oO0°%]\s*4\s*6\s*'/i.test(tr) || /E\s*1180\s*4\s*6\s*'/i.test(tr);
}
function normalizeOrdinanceOcrText(text: string): string {
  if (!text.trim()) return text;
  let t = text;
  // Latitude: leading "09" misread as "0o", "0%", etc. (Pambato ~N 09°52′)
  t = t.replace(/\bN\s+0[oO0%]\s+52'/gi, "N 09o 52'");
  t = t.replace(/\bN\s+0%\s+52'/gi, "N 09o 52'");
  t = t.replace(/\bN\s+09[oO]\s+52"\s*/gi, "N 09o 52'");
  // Minutes sign mis-OCR'd as " before seconds: 52"22.6" → 52'22.6"
  t = t.replace(/(\d{1,2})"\s*(\d{1,2}(?:\.\d+)?)"/g, "$1'$2\"");
  // Longitude: 118° misread as 118% or 1180 (digit zero)
  t = t.replace(/\bE\s+118\s*%\s*/gi, "E 118o ");
  t = t.replace(/\bE\s+1180\s+/gi, "E 118o ");
  return t;
}

/**
 * PDF text order often places West longitudes *after* the "PAMBATO REEF EAST" heading.
 * Pull longitude-only rows from the full document into this section's scope by lng band.
 */
function appendDetachedLongitudeLines(
  scope: string,
  fullText: string,
  sectionKey: NamedSectionKey,
): string {
  if (sectionKey !== "west" && sectionKey !== "east") return scope;
  const seenLine = new Set(
    scope
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean),
  );
  const seenLng = new Set<string>();
  const extras: string[] = [];
  for (const line of fullText.split(/\r?\n/)) {
    const tr = line.trim();
    if (!tr || seenLine.has(tr)) continue;
    const latD = extractDmsComponent(tr, "lat");
    const lngD = extractDmsComponent(tr, "lng");
    if (latD !== null || lngD === null) continue;
    if (sectionKey === "west" && !isWestStyleLongitudeDmsLine(tr)) continue;
    if (sectionKey === "east" && !isEastStyleLongitudeDmsLine(tr)) continue;
    if (!isWithinPalawanBounds(9.87, lngD)) continue;
    const k = lngD.toFixed(5);
    if (seenLng.has(k)) continue;
    seenLng.add(k);
    extras.push(tr);
  }
  if (extras.length === 0) return scope;
  return `${scope}\nLONGTITUDE\n${extras.join("\n")}`;
}

const toDecimalFromDms = (deg: number, min: number, sec: number, hemi: string): number => {
  const unsigned = deg + min / 60 + sec / 3600;
  return hemi === "S" || hemi === "W" ? -unsigned : unsigned;
};

/** Rejects minute/second overflow so random integers (e.g. ordinance numbering) are not treated as DMS. */
function isValidDmsComponents(deg: number, min: number, sec: number, maxDeg: number): boolean {
  if (!Number.isFinite(deg) || !Number.isFinite(min) || !Number.isFinite(sec)) return false;
  if (deg < 0 || deg > maxDeg) return false;
  if (min < 0 || min >= 60) return false;
  if (sec < 0 || sec >= 60) return false;
  return true;
}

function dedupeConsecutiveIdenticalPoints(points: ParsedPoint[], decimals = 8): ParsedPoint[] {
  const out: ParsedPoint[] = [];
  for (const p of points) {
    const key = `${p.lat.toFixed(decimals)}_${p.lng.toFixed(decimals)}`;
    const prev = out[out.length - 1];
    if (!prev || `${prev.lat.toFixed(decimals)}_${prev.lng.toFixed(decimals)}` !== key) {
      out.push(p);
    }
  }
  return out;
}

const isValidLatLng = (lat: number, lng: number): boolean =>
  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

const isWithinPalawanBounds = (lat: number, lng: number): boolean =>
  lat >= PALAWAN_LAT_MIN &&
  lat <= PALAWAN_LAT_MAX &&
  lng >= PALAWAN_LNG_MIN &&
  lng <= PALAWAN_LNG_MAX;

const ensureClosed = (points: ParsedPoint[]): ParsedPoint[] => {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  if (first.lat === last.lat && first.lng === last.lng) return points;
  return [...points, { ...first }];
};

function distanceMeters(a: ParsedPoint, b: ParsedPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return r * c;
}

function keepLargestNearbyCluster(points: ParsedPoint[], maxNeighborDistanceM = 25_000): ParsedPoint[] {
  if (points.length <= 3) return points;
  const n = points.length;
  const visited = new Array(n).fill(false);
  const clusters: number[][] = [];

  for (let i = 0; i < n; i += 1) {
    if (visited[i]) continue;
    const queue = [i];
    visited[i] = true;
    const cluster: number[] = [];

    while (queue.length > 0) {
      const idx = queue.shift()!;
      cluster.push(idx);
      for (let j = 0; j < n; j += 1) {
        if (visited[j]) continue;
        if (distanceMeters(points[idx], points[j]) <= maxNeighborDistanceM) {
          visited[j] = true;
          queue.push(j);
        }
      }
    }
    clusters.push(cluster);
  }

  clusters.sort((a, b) => b.length - a.length);
  return clusters[0].map((idx) => points[idx]);
}

/** Same as keepLargestNearbyCluster but keeps original vertex order (critical for metes-and-bounds tables). */
function keepLargestNearbyClusterPreserveOrder(
  points: ParsedPoint[],
  maxNeighborDistanceM = 25_000,
): ParsedPoint[] {
  if (points.length <= 3) return points;
  const keep = new Set(
    keepLargestNearbyCluster(points, maxNeighborDistanceM).map(
      (p) => `${p.lat.toFixed(8)}_${p.lng.toFixed(8)}`,
    ),
  );
  return points.filter((p) => keep.has(`${p.lat.toFixed(8)}_${p.lng.toFixed(8)}`));
}

function orderPointsByAngle(points: ParsedPoint[]): ParsedPoint[] {
  if (points.length <= 3) return points;
  const center = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat / points.length, lng: acc.lng + p.lng / points.length }),
    { lat: 0, lng: 0 },
  );
  return [...points].sort((a, b) => {
    const angleA = Math.atan2(a.lat - center.lat, a.lng - center.lng);
    const angleB = Math.atan2(b.lat - center.lat, b.lng - center.lng);
    return angleA - angleB;
  });
}

function directionFromStandaloneLine(trimmed: string): NamedSectionKey | null {
  const m = trimmed.match(/^(WEST|EAST|NORTH|SOUTH)\s*\.?\s*$/i);
  return m ? (m[1].toLowerCase() as NamedSectionKey) : null;
}

function matchesSectionHeading(line: string, section: NamedSectionKey): boolean {
  const dir =
    section === "west"
      ? "WEST"
      : section === "east"
        ? "EAST"
        : section === "north"
          ? "NORTH"
          : "SOUTH";
  // Policy / narrative lines mention both reefs ("West and ... East Reefs") — must NOT act as section headers.
  if (/\b(hereby|declared|shall be known|section\s+\d|article\s+\d)\b/i.test(line)) {
    return false;
  }
  // Primary: ordinance table titles, e.g. "PAMBATO REEF WEST"
  if (new RegExp(`PAMBATO\\s+REEF\\s+${dir}\\b`, "i").test(line)) return true;
  if (new RegExp(`\\bREEF\\s+${dir}\\b`, "i").test(line)) return true;
  // Do not treat generic "west + reef" in prose as a boundary (too noisy).
  return false;
}

/** Headings in document order. PDFs often split "PAMBATO REEF" and "EAST" across two lines. */
function findSectionHeadingHits(text: string): SectionHeadingHit[] {
  const lines = text.split(/\r?\n/);
  const raw: SectionHeadingHit[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    (["west", "east", "north", "south"] as NamedSectionKey[]).forEach((key) => {
      if (matchesSectionHeading(trimmed, key)) {
        raw.push({ idx, key });
      }
    });

    const solo = directionFromStandaloneLine(trimmed);
    if (solo) {
      let j = idx - 1;
      while (j >= 0 && !lines[j].trim()) j -= 1;
      const prev = j >= 0 ? lines[j].trim() : "";
      // Require a real subsection title line (PDF often splits "PAMBATO REEF" / "EAST").
      const prevLooksLikeReefTitle =
        /\bpambato\s+reef\s*$/i.test(prev) ||
        (/\breef\s*$/i.test(prev) && !/\b(hereby|declared|whereas|section\s+\d)\b/i.test(prev));
      if (prevLooksLikeReefTitle) {
        raw.push({ idx, key: solo });
      }
    }
  });

  raw.sort((a, b) => (a.idx !== b.idx ? a.idx - b.idx : a.key.localeCompare(b.key)));
  const deduped: SectionHeadingHit[] = [];
  for (const h of raw) {
    const prev = deduped[deduped.length - 1];
    if (!prev || prev.idx !== h.idx || prev.key !== h.key) {
      deduped.push(h);
    }
  }
  // PDFs often repeat the same table title (e.g. "PAMBATO REEF EAST" twice). That used to create
  // two rings both labeled "East". Keep the first heading per compass direction only.
  const onePerDirection: SectionHeadingHit[] = [];
  const usedKeys = new Set<NamedSectionKey>();
  for (const h of deduped) {
    if (usedKeys.has(h.key)) continue;
    usedKeys.add(h.key);
    onePerDirection.push(h);
  }
  return onePerDirection;
}

/** Starts a new coordinate polygon slice (not narrative "section of the …"). */
function isNewSectionOrZoneHeadingLine(trimmed: string): boolean {
  const t = trimmed;
  if (!t || t.length > 200) return false;
  if (/^\s*section\s+of\b/i.test(t)) return false;
  if (/^\s*zone\b/i.test(t)) {
    if (/\b(hereby|declared|whereas|whereof|pursuant)\b/i.test(t)) return false;
    return /^\s*zone\s+\S+/i.test(t);
  }
  if (/^\s*section\b/i.test(t)) {
    if (/\b(hereby|declared|whereas|whereof|pursuant)\b/i.test(t)) return false;
    if (
      /^section\s+\d+\s*[\.,]\s+(?:the|this|it|purpose|penalt|effectiv|coverage|appli|scope|defin)/i.test(
        t,
      )
    ) {
      return false;
    }
    return (
      /^\s*section\s+\d+/i.test(t) ||
      /^\s*section\s+[IVXLC]+/i.test(t) ||
      /^\s*section\s+[A-Za-z](?:\s*[.:)\-–]|$)/i.test(t) ||
      /^\s*\d+\.\s*section\b/i.test(t)
    );
  }
  return false;
}

/** End of boundary table for the current slice (do not ingest coordinates after this). */
function isTotalAreaBoundaryLine(trimmed: string): boolean {
  return (
    /\b(?:total|aggregate|gross)\s+area\b/i.test(trimmed) ||
    /^\s*area\s*[:(]\s*total\b/i.test(trimmed)
  );
}

function findSectionOrZoneHeadingHits(lines: string[]): SectionOrZoneHit[] {
  const hits: SectionOrZoneHit[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (isNewSectionOrZoneHeadingLine(trimmed)) {
      hits.push({ idx, label: trimmed.slice(0, 120) });
    }
  });
  return hits;
}

/** DMS lat/lng pairs on one line: strict regex first, then permissive row parse when OCR drops a minute mark. */
function extractDmsPairsForOrdinanceLine(line: string): ParsedPoint[] {
  const strict = extractStrictDmsLatLngPairsFromLine(line);
  if (strict.length > 0) return strict;
  const latDms = extractDmsComponent(line, "lat");
  const lngDms = extractDmsComponent(line, "lng");
  if (latDms === null || lngDms === null) return [];
  if (!isValidLatLng(latDms, lngDms) || !isWithinPalawanBounds(latDms, lngDms)) return [];
  if (!looksLikeCoordinateContext(line)) return [];
  return [{ lat: latDms, lng: lngDms, source: "dms" }];
}

/**
 * Build closed rings from Section/Zone slices: DMS pairs only, stop at next header or total-area line,
 * close by repeating the first vertex once at the end (no clustering / cross-zone merge).
 */
function extractAllSectionsFromOrdinance(
  lines: string[],
  hits: SectionOrZoneHit[],
): { rings: [number, number][][]; ringLabels: string[] } {
  const rings: [number, number][][] = [];
  const ringLabels: string[] = [];

  for (let i = 0; i < hits.length; i += 1) {
    const contentStart = hits[i].idx + 1;
    let contentEnd = i + 1 < hits.length ? hits[i + 1].idx : lines.length;
    for (let j = contentStart; j < contentEnd && j < lines.length; j += 1) {
      const tr = lines[j].trim();
      if (tr && isTotalAreaBoundaryLine(tr)) {
        contentEnd = j;
        break;
      }
    }

    const pts: ParsedPoint[] = [];
    for (let j = contentStart; j < contentEnd; j += 1) {
      const tr = lines[j].trim();
      if (!tr) continue;
      if (/pt\.?\s*\d+\s+is\s+\d+\s*m\b/i.test(tr)) continue;
      if (/^(latitude|longitude|lattitude|longtitude|corner)\b/i.test(tr)) continue;
      if (isIgnorableNoiseLine(tr)) continue;
      pts.push(...extractDmsPairsForOrdinanceLine(tr));
    }

    const ring = closeRingLatLngRepeatFirstOnceAtEnd(pts);
    if (ring && ring.length >= 4) {
      rings.push(ring);
      ringLabels.push(hits[i].label || `Slice ${i + 1}`);
    }
  }

  return { rings, ringLabels };
}

/** Open ring deduped; then exactly one closing duplicate of the first point at the end. */
function closeRingLatLngRepeatFirstOnceAtEnd(points: ParsedPoint[]): [number, number][] | null {
  let open = dedupeConsecutiveIdenticalPoints(points);
  if (open.length < 3) return null;
  const first = open[0];
  const last = open[open.length - 1];
  if (last.lat === first.lat && last.lng === first.lng) {
    open = open.slice(0, -1);
  }
  if (open.length < 3) return null;
  return [...open.map((p) => [p.lat, p.lng] as [number, number]), [first.lat, first.lng]];
}

function getSectionScopedText(text: string, mode: PolygonSectionMode): string {
  const full = normalizeOrdinanceOcrText(text);
  if (mode === "all") return full;

  const lines = full.split(/\r?\n/);
  const headingIdx = findSectionHeadingHits(full);

  if (headingIdx.length === 0) return full;

  const pickIndex =
    mode === "auto"
      ? 0
      : headingIdx.findIndex((h) => h.key === mode);

  // Do not fall back to the full ordinance: that merges every table and breaks counts / labels.
  if (pickIndex < 0) return "";

  const start = headingIdx[pickIndex].idx;
  let end = pickIndex + 1 < headingIdx.length ? headingIdx[pickIndex + 1].idx : lines.length;
  if (end <= start) {
    end = Math.min(start + 80, lines.length);
  }
  const scoped = lines.slice(Math.max(0, start - 2), end).join("\n").trim();

  const keyForAppend: NamedSectionKey | null =
    mode === "west" || mode === "east"
      ? mode
      : mode === "auto"
        ? headingIdx[pickIndex]?.key ?? null
        : null;
  if (keyForAppend === "west" || keyForAppend === "east") {
    return appendDetachedLongitudeLines(scoped, full, keyForAppend);
  }
  return scoped;
}

function looksLikeUtmEastingNorthing(e: number, n: number): boolean {
  return (
    Math.abs(e) >= 100_000 &&
    Math.abs(e) <= 900_000 &&
    Math.abs(n) >= 500_000 &&
    Math.abs(n) <= 2_500_000
  );
}

function textMentionsUtm51(text: string): boolean {
  return /\b51\s*N\b/i.test(text) || /\bzone\s*51\b/i.test(text) || /\butm\s*51\b/i.test(text);
}

function textMentionsPrs92(text: string): boolean {
  return /PRS\s*92|PRS92|EPSG\s*[: ]*4683/i.test(text);
}

function parsePairToWgs84(
  rawFirst: number,
  rawSecond: number,
  coordinateSystem: CoordinateSystem,
  text: string,
): { lat: number; lng: number } | null {
  let lat = rawFirst;
  let lng = rawSecond;

  if (coordinateSystem === "UTM51N") {
    const forceUtm = textMentionsUtm51(text) || looksLikeUtmEastingNorthing(rawFirst, rawSecond);
    if (forceUtm) {
      try {
        const c = proj4(utm51n, wgs84, [rawFirst, rawSecond]);
        return { lat: c[1], lng: c[0] };
      } catch {
        return null;
      }
    }
    if (Math.abs(rawFirst) > 90 && Math.abs(rawSecond) <= 90) {
      lat = rawSecond;
      lng = rawFirst;
    } else {
      lat = rawFirst;
      lng = rawSecond;
    }
    return isValidLatLng(lat, lng) ? { lat, lng } : null;
  }

  if (coordinateSystem === "PRS92") {
    const usePrs = textMentionsPrs92(text);
    let lat0 = rawFirst;
    let lng0 = rawSecond;
    if (Math.abs(rawFirst) > 90 && Math.abs(rawSecond) <= 90) {
      lat0 = rawSecond;
      lng0 = rawFirst;
    }
    if (usePrs) {
      try {
        const c = proj4(prs92, wgs84, [lng0, lat0]);
        return { lat: c[1], lng: c[0] };
      } catch {
        return null;
      }
    }
    return isValidLatLng(lat0, lng0) ? { lat: lat0, lng: lng0 } : null;
  }

  if (Math.abs(rawFirst) > 90 && Math.abs(rawSecond) <= 90) {
    lat = rawSecond;
    lng = rawFirst;
  } else {
    lat = rawFirst;
    lng = rawSecond;
  }
  return isValidLatLng(lat, lng) ? { lat, lng } : null;
}

function extractPairsFromLines(text: string): [number, number][] {
  const out: [number, number][] = [];
  const lines = text.split(/\r?\n/);
  const lineNum = /^[\s]*(?:Point|PT|Corner|P|Vertex|V)?[\s.:)\-]*(\d+)[\s.:)\-]+/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5) continue;
    if (isIgnorableNoiseLine(trimmed)) continue;
    if (!looksLikeCoordinateContext(trimmed)) continue;
    if (/pt\.?\s*\d+\s+is\s+\d+\s*m\b/i.test(trimmed)) continue;
    const withoutLabel = trimmed.replace(lineNum, "").trim();
    const nums = withoutLabel.match(/-?\d+(?:\.\d+)?/g);
    if (nums && nums.length >= 2) {
      const a = parseFloat(nums[0]);
      const b = parseFloat(nums[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) out.push([a, b]);
    }
  }
  return out;
}

function looksLikeCoordinateContext(line: string): boolean {
  return (
    /\b(latitude|longitude|lattitude|longtitude|corner|vertex|metes|bounds|zone\s*51|utm)\b/i.test(line) ||
    /[NS].*[EW]|[EW].*[NS]/i.test(line) ||
    /\b(?:n|s)\s*\d{1,3}\s*[°o0%]/i.test(line) ||
    /\b(?:e|w)\s*\d{1,3}\s*[°o0%]/i.test(line) ||
    /^\s*(?:point|pt|corner|vertex)\s*[\d.:)\-]/i.test(line)
  );
}

function isIgnorableNoiseLine(line: string): boolean {
  const noiseLine =
    /\b(section|article|page|remarks?|effectivity|penalt(?:y|ies)|ordinance|sangguniang|whereas|prohibition|scope|policy|definition|city)\b/i;
  if (!noiseLine.test(line)) return false;
  return !looksLikeCoordinateContext(line);
}

function pickCoordinateFocusedLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const selected = new Set<number>();
  let inCoordinateSection = false;
  let cooldown = 0;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const headingHit = /\b(latitude|longitude|lattitude|longtitude|corner|metes and bounds|zone\s*51|utm)\b/i.test(
      trimmed,
    );
    const contextHit = looksLikeCoordinateContext(trimmed);

    if (headingHit) {
      inCoordinateSection = true;
      cooldown = 12;
    } else if (cooldown > 0) {
      cooldown -= 1;
    } else if (inCoordinateSection && /\b(section|article|prohibition|penalt(?:y|ies)|effectivity)\b/i.test(trimmed)) {
      inCoordinateSection = false;
    }

    if (contextHit || inCoordinateSection || cooldown > 0) {
      selected.add(idx);
      selected.add(Math.max(0, idx - 1));
      selected.add(Math.min(lines.length - 1, idx + 1));
    }
  });

  return [...selected]
    .sort((a, b) => a - b)
    .map((i) => lines[i].trim())
    .filter(Boolean);
}

function extractDmsComponent(line: string, hemisphereClass: "lat" | "lng"): number | null {
  const hemi = hemisphereClass === "lat" ? "[NS]" : "[EW]";
  const regex = new RegExp(
    `(${hemi})\\s*(\\d{1,3})\\s*[°o0%]?\\s*(\\d{1,2})\\s*['’′]?\\s*(\\d{1,2}(?:\\.\\d+)?)\\s*["”″]?|` +
      `(\\d{1,3})\\s*[°o0%]?\\s*(\\d{1,2})\\s*['’′]?\\s*(\\d{1,2}(?:\\.\\d+)?)\\s*["”″]?\\s*(${hemi})`,
    "i",
  );
  const m = line.match(regex);
  if (!m) return null;

  const hemisphere = (m[1] || m[8] || "").toUpperCase();
  const deg = Number(m[2] || m[5]);
  const min = Number(m[3] || m[6]);
  const sec = Number(m[4] || m[7]);

  if (!Number.isFinite(deg) || !Number.isFinite(min) || !Number.isFinite(sec)) return null;
  return toDecimalFromDms(deg, min, sec, hemisphere);
}

function dedupePoints(found: ParsedPoint[], decimals = 6): ParsedPoint[] {
  const deduped: ParsedPoint[] = [];
  const seen = new Set<string>();
  found.forEach((p) => {
    const key = `${p.lat.toFixed(decimals)}_${p.lng.toFixed(decimals)}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(p);
    }
  });
  return deduped;
}

function extractStrictDmsLatLngPairsFromLine(line: string): ParsedPoint[] {
  const re = new RegExp(STRICT_DMS_LAT_LNG_PAIR_REGEX.source, "gi");
  const out: ParsedPoint[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const laDeg = Number(m[2]);
    const laMin = Number(m[3]);
    const laSec = Number(m[4]);
    const lnDeg = Number(m[6]);
    const lnMin = Number(m[7]);
    const lnSec = Number(m[8]);
    if (!isValidDmsComponents(laDeg, laMin, laSec, 90)) continue;
    if (!isValidDmsComponents(lnDeg, lnMin, lnSec, 180)) continue;
    const lat = toDecimalFromDms(laDeg, laMin, laSec, m[1]);
    const lng = toDecimalFromDms(lnDeg, lnMin, lnSec, m[5]);
    if (isValidLatLng(lat, lng) && isWithinPalawanBounds(lat, lng)) {
      out.push({ lat, lng, source: "dms" });
    }
  }
  return out;
}

const REEF_SECTION_LABEL: Record<NamedSectionKey, string> = {
  west: "West",
  east: "East",
  north: "North",
  south: "South",
};

function labelForPolygonSectionMode(mode: PolygonSectionMode, normalizedFullText: string): string {
  if (mode === "all") return "All sections";
  if (mode === "west" || mode === "east" || mode === "north" || mode === "south") {
    return REEF_SECTION_LABEL[mode];
  }
  const hits = findSectionHeadingHits(normalizedFullText);
  if (mode === "auto") {
    const k = hits[0]?.key;
    return k ? REEF_SECTION_LABEL[k] : "Auto";
  }
  return "Import";
}

/**
 * DMS corner rows in document order, split whenever a new Section/Zone heading or reef compass
 * table title appears. Clears the point buffer on each such header so tables are not merged.
 */
function extractCornerRowDmsPairsBySection(text: string): { name: string; points: ParsedPoint[] }[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: { name: string; points: ParsedPoint[] }[] = [];
  let currentName = "Import";
  let buffer: ParsedPoint[] = [];

  const flushBuffer = () => {
    if (buffer.length === 0) return;
    sections.push({ name: currentName, points: dedupeConsecutiveIdenticalPoints(buffer) });
    buffer = [];
  };

  const startNewSection = (name: string) => {
    flushBuffer();
    currentName = name;
  };

  for (const line of lines) {
    if (isNewSectionOrZoneHeadingLine(line)) {
      startNewSection(line.slice(0, 120));
      continue;
    }
    let reefKey: NamedSectionKey | null = null;
    for (const key of ["west", "east", "north", "south"] as NamedSectionKey[]) {
      if (matchesSectionHeading(line, key)) {
        reefKey = key;
        break;
      }
    }
    if (reefKey) {
      startNewSection(REEF_SECTION_LABEL[reefKey]);
      continue;
    }

    if (/pt\.?\s*\d+\s+is\s+\d+\s*m\b/i.test(line)) continue;
    if (/^(latitude|longitude|lattitude|longtitude|corner)\b/i.test(line)) continue;
    if (isIgnorableNoiseLine(line)) continue;

    buffer.push(...extractDmsPairsForOrdinanceLine(line));
  }
  flushBuffer();
  return sections;
}

/** Strict N/S + E/W DMS pairs on each line (document order). Falls back to `extractDmsComponent` only when the line has no strict pair (OCR sometimes drops the minute mark). */
function extractCornerRowDmsPairsInOrder(text: string): ParsedPoint[] {
  const parts = extractCornerRowDmsPairsBySection(text);
  return parts.flatMap((s) => s.points);
}

function countStrictDmsLatLngPairPatternsInText(text: string): number {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let n = 0;
  for (const line of lines) {
    if (/pt\.?\s*\d+\s+is\s+\d+\s*m\b/i.test(line)) continue;
    if (/^(latitude|longitude|lattitude|longtitude|corner)\b/i.test(line)) continue;
    if (isIgnorableNoiseLine(line)) continue;
    n += extractStrictDmsLatLngPairsFromLine(line).length;
  }
  return n;
}

function ringSelfIntersectsWgs84(closedLatLngRing: ParsedPoint[]): boolean {
  if (closedLatLngRing.length < 5) return false;
  try {
    const coords = closedLatLngRing.map((p) => [p.lng, p.lat] as [number, number]);
    const poly = turfPolygon([coords]);
    const k = kinks(poly);
    return k.features.length > 0;
  } catch {
    return false;
  }
}

type GatherPointsResult = {
  points: ParsedPoint[];
  /** Ordinance table lat/lng columns — keep row order instead of convex angle sort. */
  preferSequentialOrder: boolean;
  /** When true, do not merge/drop vertices via distance clustering (vertex count follows the ordinance table). */
  skipClustering: boolean;
  /** Valid strict lat/lng DMS pair matches in this slice (for parity with exported ring vertices before closing). */
  strictDmsPairPatternCount: number;
};

function gatherPointsFromOrdinanceSlice(
  scopedText: string,
  coordinateSystem: CoordinateSystem,
): GatherPointsResult {
  const strictSliceCount = countStrictDmsLatLngPairPatternsInText(scopedText);

  if (!scopedText.trim()) {
    return {
      points: [],
      preferSequentialOrder: false,
      skipClustering: false,
      strictDmsPairPatternCount: 0,
    };
  }

  const rowRaw = extractCornerRowDmsPairsInOrder(scopedText);
  const rowsOrdered = dedupeConsecutiveIdenticalPoints(rowRaw);
  const blockRaw = extractPairedLatLngFromBlocks(scopedText);
  const blockOrdered = dedupeConsecutiveIdenticalPoints(blockRaw);

  let tableOrdered: ParsedPoint[] = [];
  let preferSequentialOrder = false;

  if (rowsOrdered.length >= 3 && rowsOrdered.length >= blockOrdered.length) {
    tableOrdered = rowsOrdered;
    preferSequentialOrder = true;
  } else if (blockOrdered.length >= 3) {
    tableOrdered = blockOrdered;
    preferSequentialOrder = true;
  } else if (rowsOrdered.length >= 3) {
    tableOrdered = rowsOrdered;
    preferSequentialOrder = true;
  }

  if (tableOrdered.length >= 3) {
    return {
      points: tableOrdered,
      preferSequentialOrder: true,
      skipClustering: true,
      strictDmsPairPatternCount: strictSliceCount,
    };
  }

  const found: ParsedPoint[] = [];
  const focusedText = pickCoordinateFocusedLines(scopedText).join("\n");
  const looseFocus = focusedText.trim().length < 20 ? scopedText : focusedText;
  found.push(...blockOrdered);
  found.push(...rowsOrdered);

  for (const line of looseFocus.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    found.push(...extractStrictDmsLatLngPairsFromLine(trimmed));
  }

  let m: RegExpExecArray | null;
  for (const line of looseFocus.split(/\r?\n/)) {
    if (!looksLikeCoordinateContext(line)) continue;
    const decRe = new RegExp(DECIMAL_PAIR_REGEX.source, "g");
    let dm: RegExpExecArray | null;
    while ((dm = decRe.exec(line)) !== null) {
      const pair = parsePairToWgs84(Number(dm[1]), Number(dm[2]), coordinateSystem, line);
      if (pair && isWithinPalawanBounds(pair.lat, pair.lng)) {
        found.push({ lat: pair.lat, lng: pair.lng, source: "decimal" });
      }
    }
  }

  extractPairsFromLines(looseFocus).forEach(([a, b]) => {
    const pair = parsePairToWgs84(a, b, coordinateSystem, looseFocus);
    if (pair && isWithinPalawanBounds(pair.lat, pair.lng)) {
      found.push({ lat: pair.lat, lng: pair.lng, source: "decimal" });
    }
  });

  if (textMentionsUtm51(looseFocus)) {
    const utmRe = new RegExp(UTM_PAIR_REGEX.source, "gi");
    for (const um of looseFocus.matchAll(utmRe)) {
      const easting = Number(um[2]);
      const northing = Number(um[3]);
      try {
        const c = proj4(utm51n, wgs84, [easting, northing]);
        const lng = c[0];
        const lat = c[1];
        if (isValidLatLng(lat, lng) && isWithinPalawanBounds(lat, lng)) {
          found.push({ lat, lng, source: "decimal" });
        }
      } catch {
        /* ignore */
      }
    }
  }

  return {
    points: dedupePoints(found),
    preferSequentialOrder: false,
    skipClustering: false,
    strictDmsPairPatternCount: strictSliceCount,
  };
}

function finalizeClosedRingLatLng(
  deduped: ParsedPoint[],
  options: { preferSequentialOrder?: boolean; skipClustering?: boolean } = {},
): [number, number][] | null {
  if (deduped.length < 3) return null;
  const clustered = options.skipClustering
    ? deduped
    : options.preferSequentialOrder
      ? keepLargestNearbyClusterPreserveOrder(deduped)
      : keepLargestNearbyCluster(deduped);
  let ordered =
    options.skipClustering || options.preferSequentialOrder ? clustered : orderPointsByAngle(clustered);
  if (ordered.length < 3) return null;

  let closedParsed = ensureClosed(ordered);

  if (options.preferSequentialOrder && ringSelfIntersectsWgs84(closedParsed) && clustered.length >= 3) {
    const byAngle = orderPointsByAngle(clustered);
    const closedAngle = ensureClosed(byAngle);
    if (!ringSelfIntersectsWgs84(closedAngle)) {
      ordered = byAngle;
      closedParsed = closedAngle;
    }
  }

  return closedParsed.map((p) => [p.lat, p.lng]);
}

/** Multiple rings: Section/Zone–sliced DMS tables when those headings exist; else legacy reef headings + gather. */
function extractRingsWithLabelsFromOrdinance(
  text: string,
  coordinateSystem: CoordinateSystem,
): { rings: [number, number][][]; ringLabels: string[] } {
  const normalized = normalizeOrdinanceOcrText(text);
  const lines = normalized.split(/\r?\n/);

  const sectionOrZoneHits = findSectionOrZoneHeadingHits(lines);
  if (sectionOrZoneHits.length > 0) {
    const fromSections = extractAllSectionsFromOrdinance(lines, sectionOrZoneHits);
    if (fromSections.rings.length > 0) {
      return fromSections;
    }
  }

  const hits = findSectionHeadingHits(normalized);
  const labelPretty: Record<NamedSectionKey, string> = {
    west: "West",
    east: "East",
    north: "North",
    south: "South",
  };

  if (hits.length === 0) {
    const g = gatherPointsFromOrdinanceSlice(normalized, coordinateSystem);
    if (g.points.length < 3) return { rings: [], ringLabels: [] };
    const ring = finalizeClosedRingLatLng(g.points, {
      preferSequentialOrder: g.preferSequentialOrder,
      skipClustering: g.skipClustering,
    });
    if (!ring || ring.length < 4) return { rings: [], ringLabels: [] };
    return { rings: [ring], ringLabels: ["Import"] };
  }

  const rings: [number, number][][] = [];
  const ringLabels: string[] = [];

  for (let i = 0; i < hits.length; i += 1) {
    const start = hits[i].idx;
    const end = i + 1 < hits.length ? hits[i + 1].idx : lines.length;
    let scoped = lines.slice(Math.max(0, start - 2), end).join("\n");
    scoped = appendDetachedLongitudeLines(scoped, normalized, hits[i].key);
    const g = gatherPointsFromOrdinanceSlice(scoped, coordinateSystem);
    if (g.points.length < 3) continue;
    const ring = finalizeClosedRingLatLng(g.points, {
      preferSequentialOrder: g.preferSequentialOrder,
      skipClustering: g.skipClustering,
    });
    if (ring && ring.length >= 4) {
      rings.push(ring);
      ringLabels.push(labelPretty[hits[i].key]);
    }
  }

  return { rings, ringLabels };
}

function estimateAreaHectaresFromOpenPoints(points: ParsedPoint[]): number | null {
  if (points.length < 3) return null;
  const closed = ensureClosed(points);
  try {
    const turfPoly = turfPolygon([closed.map((p) => [p.lng, p.lat])]);
    return turfArea(turfPoly) / 10000;
  } catch {
    return null;
  }
}

function orderVerticesForDisplayedSection(points: ParsedPoint[]): {
  ordered: ParsedPoint[];
  selfIntersectionAdjusted: boolean;
} {
  const clustered = dedupeConsecutiveIdenticalPoints(points);
  if (clustered.length < 3) return { ordered: clustered, selfIntersectionAdjusted: false };
  let ordered = clustered;
  let closed = ensureClosed(ordered);
  if (ringSelfIntersectsWgs84(closed) && clustered.length >= 3) {
    const byAngle = orderPointsByAngle(clustered);
    const closedAngle = ensureClosed(byAngle);
    if (!ringSelfIntersectsWgs84(closedAngle)) {
      return { ordered: byAngle, selfIntersectionAdjusted: true };
    }
  }
  return { ordered, selfIntersectionAdjusted: false };
}

function CoordinatesTable({
  name,
  points,
}: {
  name: string;
  points: ParsedPoint[];
}) {
  const areaHa = useMemo(() => estimateAreaHectaresFromOpenPoints(points), [points]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="shrink-0">{name}</Label>
        <Badge variant="secondary">{points.length} points</Badge>
      </div>
      <div className="border rounded-lg overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2 text-left">Point</th>
              <th className="p-2 text-left">Latitude</th>
              <th className="p-2 text-left">Longitude</th>
              <th className="p-2 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, idx) => (
              <tr key={`${name}-${p.lat}-${p.lng}-${idx}`} className="border-t">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{p.lat.toFixed(6)}</td>
                <td className="p-2">{p.lng.toFixed(6)}</td>
                <td className="p-2">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {areaHa !== null && (
        <p className="text-sm text-green-700 font-medium">Estimated area: {areaHa.toFixed(2)} hectares</p>
      )}
    </div>
  );
}

function extractPairedLatLngFromBlocks(text: string): ParsedPoint[] {
  const lines = pickCoordinateFocusedLines(text);
  const latValues: number[] = [];
  const lngValues: number[] = [];
  let mode: "lat" | "lng" | null = null;

  for (const line of lines) {
    if (isIgnorableNoiseLine(line) || /pt\.?\s*\d+\s+is\s+\d+\s*m\b/i.test(line)) continue;

    if (/\b(latitude|lattitude)\b/i.test(line)) {
      mode = "lat";
      continue;
    }
    if (/\b(longitude|longtitude)\b/i.test(line)) {
      mode = "lng";
      continue;
    }

    const latDms = extractDmsComponent(line, "lat");
    const lngDms = extractDmsComponent(line, "lng");

    if (mode === "lat" && latDms !== null) {
      latValues.push(latDms);
      continue;
    }
    if (mode === "lng" && lngDms !== null) {
      lngValues.push(lngDms);
      continue;
    }

    if (latDms !== null && lngDms !== null) {
      latValues.push(latDms);
      lngValues.push(lngDms);
    } else if (latDms !== null) {
      latValues.push(latDms);
    } else if (lngDms !== null) {
      lngValues.push(lngDms);
    }
  }

  const count = Math.min(latValues.length, lngValues.length);
  const paired: ParsedPoint[] = [];
  for (let i = 0; i < count; i += 1) {
    const lat = latValues[i];
    const lng = lngValues[i];
    if (isValidLatLng(lat, lng) && isWithinPalawanBounds(lat, lng)) {
      paired.push({ lat, lng, source: "dms" });
    }
  }
  return paired;
}

export function OrdinancePolygonTool({
  coordinateSystem,
  onApplyToMap,
}: OrdinancePolygonToolProps) {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [sections, setSections] = useState<OrdinanceCoordinateSection[]>([]);
  const [geoJsonText, setGeoJsonText] = useState("");
  const [extractStatus, setExtractStatus] = useState<string>("");
  const [sectionMode, setSectionMode] = useState<PolygonSectionMode>("auto");
  /** When set, “Extract all sections” writes one MultiPolygon instead of a FeatureCollection of Polygons. */
  const [combineSectionsGeoJsonAsMultiPolygon, setCombineSectionsGeoJsonAsMultiPolygon] = useState(false);

  const closedPoints = useMemo(
    () => ensureClosed(sections[0]?.points ?? []),
    [sections],
  );

  const extractTextFromPdf = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    try {
      let text = "";
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : "") || "")
          .join("\n");
        text += `${pageText}\n`;
      }
      return text;
    } finally {
      await pdf.destroy().catch(() => {});
    }
  }, []);

  const extractTextFromDocx = useCallback(async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value || "";
  }, []);

  const extractTextFromTxt = useCallback(
    async (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Unable to read TXT file"));
        reader.readAsText(file, "UTF-8");
      }),
    [],
  );

  const extractFromFile = useCallback(
    async (file: File): Promise<string> => {
      const name = file.name.toLowerCase();
      const type = file.type.toLowerCase();
      if (name.endsWith(".pdf") || type.includes("pdf")) return extractTextFromPdf(file);
      if (name.endsWith(".docx") || type.includes("wordprocessingml")) return extractTextFromDocx(file);
      if (name.endsWith(".txt") || type.startsWith("text/")) return extractTextFromTxt(file);
      throw new Error("Use PDF, DOCX, or TXT");
    },
    [extractTextFromPdf, extractTextFromDocx, extractTextFromTxt],
  );

  const loadCombinedText = async (): Promise<string> => {
    let raw = "";
    if (manualText.trim()) raw = manualText;
    else if (sourceFile) raw = await extractFromFile(sourceFile);
    else raw = extractedText;
    return normalizeOrdinanceOcrText(raw);
  };

  const runParseOnText = (text: string) => {
    const normalized = normalizeOrdinanceOcrText(text);
    const scopedText = getSectionScopedText(text, sectionMode);
    const clearParse = () => {
      setSections([]);
      setGeoJsonText("");
    };

    if (
      sectionMode !== "auto" &&
      sectionMode !== "all" &&
      scopedText === "" &&
      findSectionHeadingHits(normalized).length > 0
    ) {
      toast.error(
        `No "${sectionMode.toUpperCase()}" section title found in the text. Check the PDF preview or try Auto.`,
      );
      clearParse();
      return;
    }

    if (sectionMode === "all") {
      const splits = extractCornerRowDmsPairsBySection(normalized);
      const built: OrdinanceCoordinateSection[] = [];
      let anyIntersectionAdjusted = false;
      for (const { name, points: rawPts } of splits) {
        if (rawPts.length < 3) continue;
        const { ordered, selfIntersectionAdjusted } = orderVerticesForDisplayedSection(rawPts);
        if (ordered.length < 3) continue;
        if (selfIntersectionAdjusted) anyIntersectionAdjusted = true;
        built.push({ name, points: ordered });
      }
      if (built.length > 0) {
        const geoJson =
          built.length === 1
            ? {
                type: "Polygon" as const,
                coordinates: [ensureClosed(built[0].points).map((p) => [p.lng, p.lat])],
              }
            : {
                type: "FeatureCollection" as const,
                features: built.map((s) => {
                  const cl = ensureClosed(s.points);
                  return {
                    type: "Feature" as const,
                    properties: { name: s.name },
                    geometry: {
                      type: "Polygon" as const,
                      coordinates: [cl.map((p) => [p.lng, p.lat])],
                    },
                  };
                }),
              };
        setSections(built);
        setGeoJsonText(JSON.stringify(geoJson, null, 2));
        if (anyIntersectionAdjusted) {
          toast.info(
            "Adjusted vertex order in one or more sections to remove self-intersections (table order was ambiguous in the PDF).",
          );
        }
        if (built.length > 1) {
          toast.success(
            `Extracted ${built.length} section(s) from DMS rows (buffer cleared at each Section/Zone/reef heading).`,
          );
        } else {
          toast.success(`Extracted ${built[0].points.length} coordinate points (ALL)`);
        }
        return;
      }
    }

    let g = gatherPointsFromOrdinanceSlice(scopedText, coordinateSystem);

    if (g.points.length < 3 && sectionMode !== "all") {
      if (sectionMode === "auto") {
        const fallback = gatherPointsFromOrdinanceSlice(normalized, coordinateSystem);
        if (fallback.points.length >= 3) {
          g = fallback;
          toast.warning("Used full ordinance text — section headers were unclear.");
        }
      } else {
        toast.error(
          `Not enough coordinates in the ${sectionMode} section. Open the text preview and confirm lat/long rows for that table.`,
        );
        clearParse();
        return;
      }
    }

    if (g.points.length < 3 && sectionMode === "all") {
      const fallbackAll = gatherPointsFromOrdinanceSlice(normalized, coordinateSystem);
      if (fallbackAll.points.length >= 3) {
        g = fallbackAll;
        toast.warning(
          "Used combined parsing for ALL — no DMS corner rows per section after header splits (check UTM/decimal tables).",
        );
      }
    }

    const clustered = g.skipClustering
      ? g.points
      : g.preferSequentialOrder
        ? keepLargestNearbyClusterPreserveOrder(g.points)
        : keepLargestNearbyCluster(g.points);
    let ordered =
      g.skipClustering || g.preferSequentialOrder ? clustered : orderPointsByAngle(clustered);

    if (ordered.length < 3) {
      toast.error(
        "Need at least 3 coordinate points. Check CRS (WGS84 vs UTM), or paste corner list / DMS lines.",
      );
      clearParse();
      return;
    }

    let closed = ensureClosed(ordered);
    if (g.preferSequentialOrder && ringSelfIntersectsWgs84(closed) && clustered.length >= 3) {
      const byAngle = orderPointsByAngle(clustered);
      const closedAngle = ensureClosed(byAngle);
      if (!ringSelfIntersectsWgs84(closedAngle)) {
        ordered = byAngle;
        closed = closedAngle;
        toast.info(
          "Adjusted vertex order to remove self-intersections (table order was ambiguous in the PDF).",
        );
      }
    }
    const geoJson = {
      type: "Polygon" as const,
      coordinates: [closed.map((p) => [p.lng, p.lat])],
    };

    setSections([
      {
        name: labelForPolygonSectionMode(sectionMode, normalized),
        points: ordered,
      },
    ]);
    setGeoJsonText(JSON.stringify(geoJson, null, 2));

    if (clustered.length < g.points.length && !g.skipClustering) {
      toast.warning(
        `Found ${g.points.length} points; using ${clustered.length} nearest points for a coherent polygon (${sectionMode.toUpperCase()}).`,
      );
    } else if (
      g.skipClustering &&
      g.strictDmsPairPatternCount > 0 &&
      g.strictDmsPairPatternCount === g.points.length
    ) {
      toast.success(
        `Extracted ${ordered.length} vertices — matches ${g.strictDmsPairPatternCount} strict DMS lat/lng pair(s) in this section (${sectionMode.toUpperCase()}).`,
      );
    } else {
      toast.success(`Extracted ${ordered.length} coordinate points (${sectionMode.toUpperCase()})`);
    }
  };

  const handleExtractText = async () => {
    setExtractStatus("");
    try {
      const text = await loadCombinedText();
      if (!text.trim()) {
        toast.error("No text loaded. Choose a file, paste text, or use Extract after upload.");
        setExtractedText("");
        return;
      }
      setExtractedText(text);
      setExtractStatus(`${text.length} characters`);
      toast.success("Text extracted — review preview below");
    } catch (error) {
      const msg = (error as Error).message;
      toast.error(`Extraction failed: ${msg}`);
      setExtractedText("");
    }
  };

  const handleExtractCoordinates = async () => {
    let text = extractedText;
    if (!text.trim()) {
      try {
        text = await loadCombinedText();
        setExtractedText(text);
      } catch (error) {
        toast.error(`Load failed: ${(error as Error).message}`);
        return;
      }
    }
    if (!text.trim()) {
      toast.error("No text to parse");
      return;
    }
    runParseOnText(text);
  };

  const handleExtractAll = async () => {
    setExtractStatus("");
    try {
      const text = await loadCombinedText();
      if (!text.trim()) {
        toast.error("No text to process — upload a file or paste ordinance text.");
        setExtractedText("");
        return;
      }
      setExtractedText(text);
      setExtractStatus(`${text.length} characters`);
      runParseOnText(text);
      toast.success("Text loaded and coordinates parsed");
    } catch (error) {
      toast.error(`Extract all failed: ${(error as Error).message}`);
    }
  };

  const baseSuggestedName = () =>
    sourceFile?.name.replace(/\.(pdf|docx|txt)$/i, "") || "Ordinance Imported MPA";

  const loadTextForOrdinance = async (): Promise<string | null> => {
    let text = extractedText;
    if (!text.trim()) {
      try {
        text = await loadCombinedText();
        setExtractedText(text);
      } catch (e) {
        toast.error(`Load failed: ${(e as Error).message}`);
        return null;
      }
    }
    if (!text.trim()) {
      toast.error("No text to parse");
      return null;
    }
    return text;
  };

  const handleExtractAllNamedSections = async () => {
    const text = await loadTextForOrdinance();
    if (!text) return;
    const { rings, ringLabels } = extractRingsWithLabelsFromOrdinance(text, coordinateSystem);
    if (rings.length === 0) {
      toast.error(
        "No polygons found. Add Section/Zone headings with DMS coordinate rows, or use West/East reef tables (legacy).",
      );
      return;
    }
    if (combineSectionsGeoJsonAsMultiPolygon) {
      setGeoJsonText(
        JSON.stringify(
          {
            type: "MultiPolygon" as const,
            coordinates: rings.map((r) => [r.map(([lat, lng]) => [lng, lat])]),
          },
          null,
          2,
        ),
      );
    } else {
      setGeoJsonText(
        JSON.stringify(
          {
            type: "FeatureCollection" as const,
            features: rings.map((r, i) => ({
              type: "Feature" as const,
              properties: { name: ringLabels[i] ?? `Section ${i + 1}` },
              geometry: {
                type: "Polygon" as const,
                coordinates: [r.map(([lat, lng]) => [lng, lat])],
              },
            })),
          },
          null,
          2,
        ),
      );
    }
    setSections(
      rings.map((r, i) => {
        const closedRing =
          r.length > 1 &&
          r[0][0] === r[r.length - 1][0] &&
          r[0][1] === r[r.length - 1][1];
        const open = closedRing ? r.slice(0, -1) : r;
        return {
          name: ringLabels[i] ?? `Section ${i + 1}`,
          points: open.map(([lat, lng]) => ({ lat, lng, source: "dms" as const })),
        };
      }),
    );
    toast.success(
      combineSectionsGeoJsonAsMultiPolygon
        ? `${rings.length} polygon(s) (${ringLabels.join(", ")}) — GeoJSON is MultiPolygon. One coordinates table per section below.`
        : `${rings.length} separate Polygon feature(s) (${ringLabels.join(", ")}) — GeoJSON is a FeatureCollection. One coordinates table per section below.`,
    );
  };

  const handleApplyAllSectionsOneMpa = async () => {
    const text = await loadTextForOrdinance();
    if (!text) return;
    const { rings, ringLabels } = extractRingsWithLabelsFromOrdinance(text, coordinateSystem);
    if (rings.length === 0) {
      toast.error("No sections to apply. Use “Extract all sections” first or check the ordinance text.");
      return;
    }
    onApplyToMap({
      rings,
      ringLabels,
      suggestedName: baseSuggestedName(),
      separateMpas: false,
    });
  };

  const handleApplyEachSectionSeparate = async () => {
    const text = await loadTextForOrdinance();
    if (!text) return;
    const { rings, ringLabels } = extractRingsWithLabelsFromOrdinance(text, coordinateSystem);
    if (rings.length === 0) {
      toast.error("No sections to apply.");
      return;
    }
    onApplyToMap({
      rings,
      ringLabels,
      suggestedName: baseSuggestedName(),
      separateMpas: true,
    });
  };

  useEffect(() => {
    if (!sourceFile) return;
    let cancelled = false;
    (async () => {
      try {
        const text = await extractFromFile(sourceFile);
        if (cancelled) return;
        setExtractedText(normalizeOrdinanceOcrText(text));
        setSections([]);
        setGeoJsonText("");
        if (!text.trim()) {
          setExtractStatus("0 characters");
          toast.warning(
            "No selectable text in file (common for scanned PDFs). Paste the ordinance text manually or use OCR.",
          );
        } else {
          setExtractStatus(`${text.length} characters`);
          toast.success("File loaded — text preview updated");
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(`Could not read file: ${(e as Error).message}`);
          setExtractedText("");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceFile, extractFromFile]);

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle>Ordinance to Polygon (Rule-based)</CardTitle>
        <CardDescription>
          Upload PDF / DOCX / TXT or paste text. Text loads automatically when you pick a file. Set CRS on the map
          (top-left) before extracting coordinates. For ordinances with multiple areas (e.g. West + East reef tables),
          use <strong>Extract all sections</strong> then <strong>Apply all as one MPA</strong> or{" "}
          <strong>Apply each section separately</strong>. When the text has <strong>Section</strong> or{" "}
          <strong>Zone</strong> headings, each slice takes DMS coordinates only until the next such heading or a{" "}
          <strong>total area</strong> line, then closes by repeating the first point once at the end (no mixing across
          slices). Otherwise the tool uses reef compass headings (West/East, etc.) as before. GeoJSON from &quot;Extract
          all sections&quot; is a <strong>FeatureCollection</strong> (one <strong>Polygon</strong> per slice); enable{" "}
          <em>Combine as MultiPolygon in GeoJSON</em> below if you need a single MultiPolygon geometry instead.
          <span className="block mt-2 text-muted-foreground">
            <strong>DMS & CRS:</strong> Degree-minute-second values from the file are converted to decimal degrees, then
            stored as <strong>WGS84</strong> on the map. The toolbar CRS (WGS84 / PRS92 / UTM 51N) tells the importer how
            to interpret <em>plain number pairs</em> (and UTM/PRS92 when applicable); it does not re-label DMS that
            already has N/S/E/W. The sidebar coordinate list is always WGS84 decimal degrees.
          </span>
          <span className="block mt-2 text-muted-foreground">
            <strong>Accuracy:</strong> Metes-and-bounds rows (lat + lng on the same line) are preferred when present;
            vertex order follows the ordinance text. Stray points are filtered while keeping that order. If the outline
            still self-crosses, the tool re-orders vertices once to remove crossings. For Ord. 390–style PDFs where
            longitudes appear far from their reef title, matching <strong>E 118°45′/47′</strong> (West) and{" "}
            <strong>E 118°46′</strong> (East) rows are merged into each section automatically.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ordinance-file">Upload Ordinance File</Label>
            <Input
              id="ordinance-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e) => {
                setSourceFile(e.target.files?.[0] ?? null);
              }}
            />
            {extractStatus ? (
              <p className="text-xs text-gray-500">Last load: {extractStatus}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>CRS for parsing (from map toolbar)</Label>
            <div className="h-10 rounded-md border px-3 flex items-center text-sm text-gray-700">
              {coordinateSystem}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Manual Text Input</Label>
          <Textarea
            rows={5}
            placeholder="Paste ordinance text here if you are not uploading a file..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="py-1.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="polygon-section-mode">Polygon Section</Label>
          <select
            id="polygon-section-mode"
            value={sectionMode}
            onChange={(e) => setSectionMode(e.target.value as PolygonSectionMode)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="auto">Auto (first named section)</option>
            <option value="west">West section only</option>
            <option value="east">East section only</option>
            <option value="north">North section only</option>
            <option value="south">South section only</option>
            <option value="all">All sections (combine)</option>
          </select>
          <p className="text-xs text-gray-500">
            Use West/East/North/South to prevent combining multiple polygons from one ordinance.
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2 py-1.5"
          role="toolbar"
          aria-label="Extract and apply ordinance to map"
        >
          {/* Extraction split — antialiased + no shadow on wrapper for sharper glyphs */}
          <div className="inline-flex shrink-0 rounded-md border border-primary/20 bg-primary text-white antialiased dark:text-primary-foreground">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-2 rounded-l-md rounded-r-none border-0 bg-transparent px-4 text-xs font-medium leading-tight text-white shadow-none hover:bg-white/10 focus-visible:z-10 dark:text-primary-foreground dark:hover:bg-primary-foreground/10"
              onClick={handleExtractAllNamedSections}
            >
              <Layers className="size-3.5 shrink-0 text-white dark:text-primary-foreground" aria-hidden />
              <span className="whitespace-nowrap font-medium tracking-wide text-white dark:text-primary-foreground">
                Extract all sections
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 w-8 shrink-0 rounded-l-none rounded-r-md border-0 border-l border-white/25 bg-transparent p-0 text-white shadow-none hover:bg-white/10 focus-visible:z-10 dark:border-primary-foreground/25 dark:text-primary-foreground dark:hover:bg-primary-foreground/10"
                  aria-label="More extraction options"
                >
                  <ChevronDown className="size-3.5 text-white dark:text-primary-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-1" sideOffset={6}>
                <DropdownMenuItem className="text-xs" onClick={handleExtractText}>
                  <FileText className="size-3.5" />
                  Extract Text
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={handleExtractCoordinates}>
                  <Crosshair className="size-3.5" />
                  Extract Coordinates
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={handleExtractAll}>
                  <Layers2 className="size-3.5" />
                  Extract Text + Coordinates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <label className="inline-flex h-8 max-w-full shrink-0 cursor-pointer select-none items-center gap-1.5 rounded-md px-1 text-[11px] leading-none text-muted-foreground hover:text-foreground sm:text-xs">
            <Checkbox
              className="size-3.5 shrink-0 border-muted-foreground/40"
              checked={combineSectionsGeoJsonAsMultiPolygon}
              onCheckedChange={(v) => setCombineSectionsGeoJsonAsMultiPolygon(v === true)}
            />
            <span className="whitespace-nowrap">Combine as MultiPolygon</span>
          </label>

          {/* Apply split button */}
          <div className="inline-flex shrink-0 rounded-md border border-primary/20 bg-primary text-white antialiased dark:text-primary-foreground">
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 gap-2 rounded-l-md rounded-r-none border-0 bg-transparent px-4 text-xs font-medium leading-tight text-white shadow-none hover:bg-white/10 focus-visible:z-10 disabled:cursor-not-allowed disabled:!opacity-100 disabled:text-white/55 disabled:[&_svg]:text-white/55 dark:text-primary-foreground dark:hover:bg-primary-foreground/10 dark:disabled:text-primary-foreground/55 dark:disabled:[&_svg]:text-primary-foreground/55"
              disabled={closedPoints.length < 4}
              onClick={() =>
                onApplyToMap({
                  rings: [closedPoints.map((p) => [p.lat, p.lng])],
                  suggestedName: baseSuggestedName(),
                })
              }
            >
              <MapPin className="size-3.5 shrink-0 text-white dark:text-primary-foreground" aria-hidden />
              <span className="whitespace-nowrap font-medium tracking-wide text-white dark:text-primary-foreground">
                Apply to Map
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 w-8 shrink-0 rounded-l-none rounded-r-md border-0 border-l border-white/25 bg-transparent p-0 text-white shadow-none hover:bg-white/10 focus-visible:z-10 dark:border-primary-foreground/25 dark:text-primary-foreground dark:hover:bg-primary-foreground/10"
                  aria-label="More apply to map options"
                >
                  <ChevronDown className="size-3.5 text-white dark:text-primary-foreground" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1" sideOffset={6}>
                <DropdownMenuItem className="text-xs" onClick={handleApplyAllSectionsOneMpa}>
                  <GitMerge className="size-3.5" />
                  Apply all as one MPA
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs" onClick={handleApplyEachSectionSeparate}>
                  <SplitSquareVertical className="size-3.5" />
                  Apply each section separately
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="ordinance-extracted-preview">Extracted Text Preview</Label>
          <Textarea
            id="ordinance-extracted-preview"
            rows={5}
            value={extractedText}
            readOnly
            className="bg-muted/30 text-sm max-h-64 min-h-[5.5rem] overflow-y-auto py-1.5 [field-sizing:fixed] resize-none"
            placeholder="Text from your file or paste will appear here…"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Coordinates tables</Label>
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No coordinates extracted yet.</p>
            ) : (
              <div className="space-y-6">
                {sections.map((s, idx) => (
                  <CoordinatesTable key={`${s.name}-${idx}`} name={s.name} points={s.points} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>GeoJSON (Polygon / FeatureCollection / MultiPolygon)</Label>
            <Textarea rows={12} value={geoJsonText} readOnly className="font-mono text-xs" placeholder="{ }" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
