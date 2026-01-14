import express from "express";
import cors from "cors";

// ROUTES
import authRoutes from "../routes/auth/auth.routes.js";

// karyawan
import KaryawanProfile from "../routes/karyawan/profileKaryawan.routes.js";
import KaryawanFace from "../routes/karyawan/faceKaryawan.routes.js";
import AbsensiKaryawanRoutes from "../routes/karyawan/absensiKaryawan.routes.js";
import PengajuanCutiRoutes from "../routes/karyawan/pengajuanCuti.routes.js";

// HRD
import LokasiPerusahaanRoutes from "../routes/hrd/lokasiKaryawan.routes.js";
import KelolaKaryawanRoutes from "../routes/hrd/kelolaKaryawan.routes.js";
import KuotaCutiRoutes from "../routes/hrd/kuotaCuti.routes.js";
import HrdAbsensiRoutes from "../routes/hrd/hrdAbsensi.routes.js";
import HrdDashboardRoutes from "../routes/hrd/hrdDashboard.routes.js";

// PENGGAJIAN
import KomponenGajiRoutes from "../routes/hrd/komponenGaji.routes.js";
import SlipGajiRoutes from "../routes/hrd/slipGaji.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded());

// routes
app.use("/api/v1", authRoutes);

// karyawan
app.use("/api/v1", KaryawanProfile);
app.use("/api/v1", KaryawanFace);
app.use("/api/v1", AbsensiKaryawanRoutes);
app.use("/api/v1", PengajuanCutiRoutes);

// hrd
app.use("/api/v1", LokasiPerusahaanRoutes);
app.use("/api/v1", KelolaKaryawanRoutes);
app.use("/api/v1", KuotaCutiRoutes);
app.use("/api/v1", HrdAbsensiRoutes);
app.use("/api/v1", HrdDashboardRoutes);

// penggajian
app.use("/api/v1", KomponenGajiRoutes);
app.use("/api/v1", SlipGajiRoutes);

export default app;
