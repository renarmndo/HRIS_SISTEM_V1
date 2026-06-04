// Lightweight validation helpers untuk API.
// Tidak pakai joi/zod untuk minim dependency, tapi konsisten dipakai
// di seluruh controller via require/import.

export function isValidInt(v, { min = -Infinity, max = Infinity } = {}) {
  const n = typeof v === "number" ? v : parseInt(v, 10);
  if (!Number.isFinite(n)) return false;
  if (n < min || n > max) return false;
  return true;
}

export function isValidFloat(v, { min = -Infinity, max = Infinity } = {}) {
  const n = typeof v === "number" ? v : parseFloat(v);
  if (!Number.isFinite(n)) return false;
  if (n < min || n > max) return false;
  return true;
}

// Parse integer query, return null jika invalid. Pemakaian:
//   const bulan = parseBulanTahun(req.query.bulan);
//   if (bulan === null) return res.status(400).json({msg: "..."});
export function parseBulan(v) {
  if (v === undefined || v === null || v === "") return null;
  return isValidInt(v, { min: 1, max: 12 }) ? parseInt(v, 10) : NaN;
}

export function parseTahun(v, { min = 1970, max = 2100 } = {}) {
  if (v === undefined || v === null || v === "") return null;
  return isValidInt(v, { min, max }) ? parseInt(v, 10) : NaN;
}

// Latitude harus -90 s/d 90, longitude -180 s/d 180.
export function isValidLatitude(v) {
  return isValidFloat(v, { min: -90, max: 90 });
}

export function isValidLongitude(v) {
  return isValidFloat(v, { min: -180, max: 180 });
}

// UUID v4 sederhana (cukup untuk validasi format, bukan strict).
export function isValidUUID(v) {
  if (typeof v !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export function isNonEmptyString(v, { minLen = 1, maxLen = 255 } = {}) {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (s.length < minLen) return false;
  if (s.length > maxLen) return false;
  return true;
}

export function isValidEmail(v) {
  if (typeof v !== "string") return false;
  if (v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
