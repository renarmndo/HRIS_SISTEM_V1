import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/login.pages";
import { Toaster } from "sonner";
import "./App.css";

// VIEW
import ProtectedRoutes from "./routes/protectedRoutes";
import HRDDashboard from "./pages/dashboard/hrdDashboard";
import KaryawanDashboard from "./pages/dashboard/karyawanDashboard";
import MainLayout from "./layouts/app.layouts";

// PAGES

// KARYAWAN
import ProfilePages from "./pages/karyawan/profilePages";
import AbsensiPage from "./pages/karyawan/absensiPage";
import DashboardCutiPage from "./pages/karyawan/cutiPage";
import DashboardGajiPage from "./pages/karyawan/gajiPage";
import MasterDataAbsen from "./pages/karyawan/masterDataAbsenPage";

// HRD
import MasterKaryawan from "./pages/hrd/kelolaKaryawan";
import DataKaryawan from "./pages/hrd/dataKaryawan";
import LokasiKantorPage from "./pages/hrd/lokasiKantor";
import KelolaAbsensiKaryawan from "./pages/hrd/kelolaAbsensi";
import KelolaCutiPage from "./pages/hrd/kelolaCuti";
import KelolaKomponenGaji from "./pages/hrd/kelolaKomponenGaji";
import KelolaSlipGaji from "./pages/hrd/kelolaSlipGaji";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* HRD */}
        <Route
          path="/hrd/dashboard"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <HRDDashboard />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/users"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <MasterKaryawan />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/karyawan"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <DataKaryawan />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/lokasi"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <LokasiKantorPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/absensi"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KelolaAbsensiKaryawan />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/leaves"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KelolaCutiPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        {/* Penggajian HRD */}
        <Route
          path="/hrd/komponen-gaji"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KelolaKomponenGaji />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/hrd/slip-gaji"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KelolaSlipGaji />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        {/* karyawan */}
        <Route
          path="/karyawan/dashboard"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KaryawanDashboard />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/karyawan/profile"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <ProfilePages />
              </ProtectedRoutes>
            </MainLayout>
          }
        />
        <Route
          path="/karyawan/absensi"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <AbsensiPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/karyawan/cuti"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <DashboardCutiPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/karyawan/gaji"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <DashboardGajiPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />

        <Route
          path="/karyawan/data-absen"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <MasterDataAbsen />
              </ProtectedRoutes>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
