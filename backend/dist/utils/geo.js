"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deg2rad = deg2rad;
exports.rad2deg = rad2deg;
exports.latLonToEnu = latLonToEnu;
exports.enuToLatLon = enuToLatLon;
exports.haversineMeters = haversineMeters;
exports.wrapAngleRad = wrapAngleRad;
exports.headingRadToCompassDeg = headingRadToCompassDeg;
exports.compassDegToHeadingRad = compassDegToHeadingRad;
const constants_1 = require("../config/constants");
function deg2rad(deg) {
    return (deg * Math.PI) / 180;
}
function rad2deg(rad) {
    return (rad * 180) / Math.PI;
}
/**
 * Equirectangular projection of a lat/lon into a local East-North-Up (ENU)
 * plane anchored at (anchorLat, anchorLon). Accurate to a few cm over the
 * scale of a single drive (tens of km) — plenty for a DR/fusion demo.
 */
function latLonToEnu(lat, lon, anchorLat, anchorLon) {
    const anchorLatRad = deg2rad(anchorLat);
    const dLat = deg2rad(lat - anchorLat);
    const dLon = deg2rad(lon - anchorLon);
    const x = dLon * constants_1.EARTH_RADIUS_METERS * Math.cos(anchorLatRad); // East, meters
    const y = dLat * constants_1.EARTH_RADIUS_METERS; // North, meters
    return { x, y };
}
function enuToLatLon(x, y, anchorLat, anchorLon) {
    const anchorLatRad = deg2rad(anchorLat);
    const dLat = y / constants_1.EARTH_RADIUS_METERS;
    const dLon = x / (constants_1.EARTH_RADIUS_METERS * Math.cos(anchorLatRad));
    return {
        latitude: anchorLat + rad2deg(dLat),
        longitude: anchorLon + rad2deg(dLon),
    };
}
/** Great-circle distance in meters (haversine) — used for session distance totals. */
function haversineMeters(lat1, lon1, lat2, lon2) {
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return constants_1.EARTH_RADIUS_METERS * c;
}
/** Normalize an angle in radians to [-pi, pi). */
function wrapAngleRad(angle) {
    let a = angle % (2 * Math.PI);
    if (a >= Math.PI)
        a -= 2 * Math.PI;
    if (a < -Math.PI)
        a += 2 * Math.PI;
    return a;
}
function headingRadToCompassDeg(headingRad) {
    // Internally heading is a standard math angle (0 = East, CCW positive).
    // Convert to compass bearing (0 = North, clockwise positive) for the UI.
    let deg = 90 - rad2deg(headingRad);
    deg = ((deg % 360) + 360) % 360;
    return deg;
}
/** Inverse of headingRadToCompassDeg — used to seed filter heading from a GNSS bearing. */
function compassDegToHeadingRad(compassDeg) {
    return deg2rad(90 - compassDeg);
}
//# sourceMappingURL=geo.js.map