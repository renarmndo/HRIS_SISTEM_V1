import express from "express";
import cors from "cors";

// ROUTES
import authRoutes from "../routes/auth/auth.routes.js";

// karyawan
import KaryawanProfile from "../routes/karyawan/profileKaryawan.routes.js";
import KaryawanFace from "../routes/karyawan/faceKaryawan.routes.js";
import AbsensiKaryawanRoutes from "../routes/karyawan/absensiKaryawan.routes.js";

// HRD
import LokasiPerusahaanRoutes from "../routes/hrd/lokasiKaryawan.routes.js";
import KelolaKaryawanRoutes from "../routes/hrd/kelolaKaryawan.routes.js";

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

// hrd
app.use("/api/v1", LokasiPerusahaanRoutes);
app.use("/api/v1", KelolaKaryawanRoutes);

export default app;
