import type { MPA } from "../data/mockData";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Center of polygon ring [lat,lng] for display */
function ringCenterLatLng(coords: [number, number][]): { lat: number; lng: number } {
  const ring = coords.length > 1 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]
    ? coords.slice(0, -1)
    : coords;
  let lat = 0;
  let lng = 0;
  const n = ring.length;
  if (n === 0) return { lat: 0, lng: 0 };
  for (let i = 0; i < n; i += 1) {
    lat += ring[i][0];
    lng += ring[i][1];
  }
  return { lat: lat / n, lng: lng / n };
}

function mpaApproxCenter(mpa: MPA): { lat: number; lng: number } {
  const rings =
    mpa.multiPolygonRings && mpa.multiPolygonRings.length > 0
      ? mpa.multiPolygonRings
      : [mpa.coordinates];
  let lat = 0;
  let lng = 0;
  let n = 0;
  rings.forEach((ring) => {
    const c = ringCenterLatLng(ring);
    lat += c.lat;
    lng += c.lng;
    n += 1;
  });
  return n > 0 ? { lat: lat / n, lng: lng / n } : { lat: 0, lng: 0 };
}

export function buildMpaPopupHtml(mpa: MPA): string {
  const { lat, lng } = mpaApproxCenter(mpa);
  const typeLabel = mpa.type.replace(/-/g, " ");
  const statusLabel = mpa.status;
  const desc = mpa.publicDescription
    ? escapeHtml(mpa.publicDescription)
    : "Marine protected area under Puerto Princesa City management. Boundaries shown are illustrative for this demo system.";
  const history = mpa.publicHistory
    ? escapeHtml(mpa.publicHistory)
    : `Established under City Ordinance ${escapeHtml(mpa.ordinanceNumber)} (${escapeHtml(mpa.dateEstablished)}).`;

  return `
    <div class="mpa-popup mpa-popup--public">
      <h3>${escapeHtml(mpa.name)}</h3>
      <p class="mpa-popup__meta"><strong>Location:</strong> ${escapeHtml(mpa.barangay)}, Puerto Princesa City, Palawan</p>
      <p class="mpa-popup__meta"><strong>Approx. center:</strong> ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E (WGS84)${
        mpa.multiPolygonRings && mpa.multiPolygonRings.length > 1
          ? ` <span class="mpa-popup__badge">${mpa.multiPolygonRings.length} areas</span>`
          : ""
      }</p>
      <p class="mpa-popup__meta"><strong>Zone type:</strong> <span class="mpa-popup__badge">${escapeHtml(typeLabel)}</span></p>
      <p class="mpa-popup__meta"><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
      <p class="mpa-popup__meta"><strong>Declared area:</strong> ${mpa.area.toFixed(1)} hectares (dataset value)</p>
      <p class="mpa-popup__meta"><strong>Ordinance:</strong> ${escapeHtml(mpa.ordinanceNumber)}</p>
      <div class="mpa-popup__section">
        <p class="mpa-popup__label">Habitat coverage (ha)</p>
        <ul class="mpa-popup__list">
          <li>Mangrove: ${mpa.ecosystems.mangrove.toFixed(1)}</li>
          <li>Seagrass: ${mpa.ecosystems.seagrass.toFixed(1)}</li>
          <li>Coral reef: ${mpa.ecosystems.coralReef.toFixed(1)}</li>
        </ul>
      </div>
      <div class="mpa-popup__section">
        <p class="mpa-popup__label">About this area</p>
        <p class="mpa-popup__text">${desc}</p>
      </div>
      <div class="mpa-popup__section">
        <p class="mpa-popup__label">History & legal basis</p>
        <p class="mpa-popup__text">${history}</p>
      </div>
      <p class="mpa-popup__note">For official boundaries and enforcement, refer to the certified ordinance map and LGU / BFAR records.</p>
    </div>
  `;
}
