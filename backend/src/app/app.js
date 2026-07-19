import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

// ROUTES
import authRoutes from "../routes/auth/auth.routes.js";

// karyawan
import KaryawanProfile from "../routes/karyawan/profileKaryawan.routes.js";
import KaryawanFace from "../routes/karyawan/faceKaryawan.routes.js";
import AbsensiKaryawanRoutes from "../routes/karyawan/absensiKaryawan.routes.js";
import PengajuanCutiRoutes from "../routes/karyawan/pengajuanCuti.routes.js";
import KaryawanDashboardRoutes from "../routes/karyawan/karyawanDashboard.routes.js";
import KaryawanLemburRoutes from "../routes/karyawan/lembur.routes.js";

// HRD
import LokasiPerusahaanRoutes from "../routes/hrd/lokasiKaryawan.routes.js";
import KelolaKaryawanRoutes from "../routes/hrd/kelolaKaryawan.routes.js";
import KuotaCutiRoutes from "../routes/hrd/kuotaCuti.routes.js";
import HrdAbsensiRoutes from "../routes/hrd/hrdAbsensi.routes.js";
import HrdDashboardRoutes from "../routes/hrd/hrdDashboard.routes.js";
import HrdLemburRoutes from "../routes/hrd/lembur.routes.js";

// PENGGAJIAN
import KomponenGajiRoutes from "../routes/hrd/komponenGaji.routes.js";
import SlipGajiRoutes from "../routes/hrd/slipGaji.routes.js";

// MIDDLEWARE
import { errorHandler, notFoundHandler } from "../middleware/errorHandler.js";

const app = express();

// SECURITY (Task 4.1): set HTTP security headers
app.use(helmet());

// SECURITY (Task 4.1): gzip compression untuk response besar
app.use(compression());

// SECURITY (Task 4.1): HTTP request logger (skip di test)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// SECURITY (Task 1.6): whitelist CORS origins (comma-separated via env, fallback dev)
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// SECURITY (Task 1.7): limit body size to prevent DoS via large payloads
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// SECURITY (Task 4.8): rate-limit global (100 req / 15 min / IP).
// Skip /auth/login agar tidak ada limit request saat login.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Terlalu banyak request, coba lagi nanti" },
  skip: (req) => req.path.includes("/auth/login") || req.originalUrl.includes("/auth/login"),
});
app.use(globalLimiter);

// SECURITY (Task 4.8): rate-limit khusus login (5 percobaan / 5 menit / IP) - REMOVED
// const loginLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000,
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { msg: "Terlalu banyak percobaan login, coba lagi dalam 5 menit" },
// });
// app.use("/api/v1/auth/login", loginLimiter);

// routes
app.use("/api/v1", authRoutes);

// karyawan
app.use("/api/v1", KaryawanProfile);
app.use("/api/v1", KaryawanFace);
app.use("/api/v1", AbsensiKaryawanRoutes);
app.use("/api/v1", PengajuanCutiRoutes);
app.use("/api/v1", KaryawanDashboardRoutes);
app.use("/api/v1", KaryawanLemburRoutes);

// hrd
app.use("/api/v1", LokasiPerusahaanRoutes);
app.use("/api/v1", KelolaKaryawanRoutes);
app.use("/api/v1", KuotaCutiRoutes);
app.use("/api/v1", HrdAbsensiRoutes);
app.use("/api/v1", HrdDashboardRoutes);
app.use("/api/v1", HrdLemburRoutes);

// penggajian
app.use("/api/v1", KomponenGajiRoutes);
app.use("/api/v1", SlipGajiRoutes);

// SECURITY (Task 4.3): 404 + global error handler di akhir chain
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
