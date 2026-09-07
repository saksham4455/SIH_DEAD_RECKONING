import { EARTH_RADIUS_METERS } from '../config/constants';

export function deg2rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function rad2deg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Equirectangular projection of a lat/lon into a local East-North-Up (ENU)
 * plane anchored at (anchorLat, anchorLon). Accurate to a few cm over the
 * scale of a single drive (tens of km) — plenty for a DR/fusion demo.
 */
export function latLonToEnu(
  lat: number,
  lon: number,
  anchorLat: number,
  anchorLon: number
): { x: number; y: number } {
  const anchorLatRad = deg2rad(anchorLat);
  const dLat = deg2rad(lat - anchorLat);
  const dLon = deg2rad(lon - anchorLon);
  const x = dLon * EARTH_RADIUS_METERS * Math.cos(anchorLatRad); // East, meters
  const y = dLat * EARTH_RADIUS_METERS; // North, meters
  return { x, y };
}

export function enuToLatLon(
  x: number,
  y: number,
  anchorLat: number,
  anchorLon: number
): { latitude: number; longitude: number } {
  const anchorLatRad = deg2rad(anchorLat);
  const dLat = y / EARTH_RADIUS_METERS;
  const dLon = x / (EARTH_RADIUS_METERS * Math.cos(anchorLatRad));
  return {
    latitude: anchorLat + rad2deg(dLat),
    longitude: anchorLon + rad2deg(dLon),
  };
}

/** Great-circle distance in meters (haversine) — used for session distance totals. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/** Normalize an angle in radians to [-pi, pi). */
export function wrapAngleRad(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a >= Math.PI) a -= 2 * Math.PI;
  if (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function headingRadToCompassDeg(headingRad: number): number {
  // Internally heading is a standard math angle (0 = East, CCW positive).
  // Convert to compass bearing (0 = North, clockwise positive) for the UI.
  let deg = 90 - rad2deg(headingRad);
  deg = ((deg % 360) + 360) % 360;
  return deg;
}

/** Inverse of headingRadToCompassDeg — used to seed filter heading from a GNSS bearing. */
export function compassDegToHeadingRad(compassDeg: number): number {
  return deg2rad(90 - compassDeg);
}
