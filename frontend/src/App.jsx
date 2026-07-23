import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./pages/login.pages";
import { Toaster, toast } from "sonner";
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
import LemburPage from "./pages/karyawan/lemburPage";

// HRD
import MasterKaryawan from "./pages/hrd/kelolaKaryawan";
import DataKaryawan from "./pages/hrd/dataKaryawan";
import LokasiKantorPage from "./pages/hrd/lokasiKantor";
import KelolaAbsensiKaryawan from "./pages/hrd/kelolaAbsensi";
import KelolaCutiPage from "./pages/hrd/kelolaCuti";
import KelolaKomponenGaji from "./pages/hrd/kelolaKomponenGaji";
import KelolaSlipGaji from "./pages/hrd/kelolaSlipGaji";
import KelolaLembur from "./pages/hrd/kelolaLembur";

function App() {
  const navigate = useNavigate();

  // FIX (Task 5.5): dengarkan event "auth:logout" dari api.js interceptor
  // dan navigasi via React Router (no full reload, preserve toast/state).
  useEffect(() => {
    function handleLogout() {
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      navigate("/", { replace: true });
    }
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

  return (
    <>
      <Toaster
        richColors
        position="top-right"
        duration={4000}
        closeButton
        toastOptions={{
          style: { maxWidth: "400px" },
        }}
      />
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

        <Route
          path="/hrd/lembur"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <KelolaLembur />
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

        <Route
          path="/karyawan/lembur"
          element={
            <MainLayout>
              <ProtectedRoutes>
                <LemburPage />
              </ProtectedRoutes>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
