/**
 * Utility untuk analisis risiko kecurangan presensi berbasis Fake GPS,
 * metadata Geolocation API, serta koneksi jaringan IP Client.
 */

/**
 * Mendapatkan IP Address asli klien dari request Express
 */
export function getClientIp(req) {
  if (!req) return null;
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // jika multiple proxies, ambil IP paling depan
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || null;
}

/**
 * Menganalisis potensi kecurangan presensi berdasarkan metadata lokasi & IP
 * @param {Object} params
 * @param {number|string} params.accuracy - Nilai accuracy GPS dari browser (meter)
 * @param {boolean} params.validasiLokasi - Apakah lokasi berada dalam radius kantor
 * @param {number} params.jarak - Jarak dari titik kantor (meter)
 * @param {number} params.radius - Radius maksimal yang diizinkan (meter)
 * @param {Object} [params.req] - Request Express (untuk membaca IP)
 * @returns {{ isSuspect: boolean, suspectReason: string, accuracyNum: number|null, clientIp: string|null }}
 */
export function analyzeGpsRisk({ accuracy, validasiLokasi, jarak, radius, req }) {
  const reasons = [];
  const accuracyNum = accuracy !== undefined && accuracy !== null && !isNaN(accuracy) ? Number(accuracy) : null;
  const clientIp = getClientIp(req);

  // 1. Cek Akurasi GPS Abnormal
  if (accuracyNum === null) {
    reasons.push("Akurasi GPS tidak terkirim/null");
  } else if (accuracyNum <= 1.0) {
    // Nilai 0m atau <= 1m sering kali merupakan hasil override DevTools / extension Fake GPS
    reasons.push(`Akurasi GPS abnormal/terlalu sempurna (${accuracyNum}m)`);
  } else if (accuracyNum > 300) {
    // Sinyal GPS sangat jelek / estimasi IP saja (> 300m)
    reasons.push(`Akurasi GPS terlalu lemah (${Math.round(accuracyNum)}m)`);
  }

  // 2. Cek Radius Kantor
  if (!validasiLokasi) {
    const margin = Math.round(jarak - radius);
    reasons.push(`Di luar radius kantor (${Math.round(jarak)}m, melampaui batas ${radius}m sebesar ${margin}m)`);
  }

  const isSuspect = reasons.length > 0;
  const suspectReason = isSuspect ? reasons.join("; ") : null;

  return {
    isSuspect,
    suspectReason,
    accuracyNum,
    clientIp,
  };
}
