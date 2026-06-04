import { useState } from "react";
import {
  useAbsensiMasuk,
  useAbsensiKeluar,
  useGetAbsensi,
  useGetAbsensiHariIni,
  useGetAbsensiMingguan,
} from "../../services/karyawan/absensi.service";
import { toast } from "sonner";

export default function useAbsensiHook() {
  const [absensiLoading, setAbsensiLoading] = useState(false);
  const [absensiError, setAbsensiError] = useState(null);
  const [absensiMasuk, setAbsensiMasuk] = useState(null);
  const [absensiHariIni, setAbsensiHariIni] = useState(null);
  const [absensiMingguan, setAbsensiMingguan] = useState([]);

  const handleAbsensiMasuk = async (data) => {
    setAbsensiLoading(true);
    setAbsensiError(null);

    try {
      const response = await useAbsensiMasuk(data);
      // Service sudah return response.data, jadi response = { msg, data }
      const { validasi_lokasi, jarak, radius } = response.data;

      setAbsensiMasuk(response);

      // Toast berdasarkan status validasi lokasi - gunakan ID yang sama untuk semua
      if (validasi_lokasi) {
        // 🟢 HIJAU: Wajah cocok + Lokasi sesuai
        toast.success(
          `✓ Absen Masuk Berhasil\n📍 Lokasi terverifikasi (${jarak}m dari kantor)`,
          { duration: 3000, id: "absen-masuk" },
        );
      } else {
        // 🟡 KUNING: Wajah cocok + Lokasi di luar radius
        toast.warning(
          `⚠ Absen Masuk Berhasil\n📍 Anda berada di luar radius kantor (${jarak}m dari batas ${radius}m)`,
          { duration: 4000, id: "absen-masuk" },
        );
      }

      await fetchDataAbsensi();
      return response;
    } catch (error) {
      console.error("Error Absensi:", error);

      const serverMessage =
        error.response?.data?.msg || "Terjadi kesalahan pada server";
      const validationDistance = error.response?.data?.distance
        ? ` (Jarak Wajah: ${error.response.data.distance.toFixed(3)})`
        : "";

      setAbsensiError(serverMessage);

      // 🔴 MERAH: Hanya tampilkan toast untuk error verifikasi wajah
      // Pesan "sudah absen" tidak ditampilkan karena seharusnya tidak terjadi
      if (serverMessage.toLowerCase().includes("wajah")) {
        toast.error(
          `✗ Verifikasi Wajah Gagal\n${serverMessage}${validationDistance}`,
          { duration: 4000, id: "absen-masuk" },
        );
      }
      // Tidak ada else - pesan lain (seperti "sudah absen") tidak ditampilkan

      throw error;
    } finally {
      setAbsensiLoading(false);
    }
  };

  const handleAbsensiKeluar = async (data) => {
    setAbsensiLoading(true);
    setAbsensiError(null);

    try {
      const response = await useAbsensiKeluar(data);
      // Service sudah return response.data, jadi response = { msg, data }
      const { validasi_lokasi, jarak, radius, durasi_kerja } = response.data;

      setAbsensiMasuk(response);

      // Toast berdasarkan status validasi lokasi - gunakan ID yang sama untuk semua
      if (validasi_lokasi) {
        // 🟢 HIJAU: Wajah cocok + Lokasi sesuai
        toast.success(
          `✓ Absen Keluar Berhasil\n📍 Lokasi terverifikasi\n⏱ Durasi kerja: ${durasi_kerja}`,
          { duration: 3000, id: "absen-keluar" },
        );
      } else {
        // 🟡 KUNING: Wajah cocok + Lokasi di luar radius
        toast.warning(
          `⚠ Absen Keluar Berhasil\n📍 Anda berada di luar radius kantor (${jarak}m dari batas ${radius}m)\n⏱ Durasi kerja: ${durasi_kerja}`,
          { duration: 4000, id: "absen-keluar" },
        );
      }

      await fetchDataAbsensi();
      return response;
    } catch (error) {
      console.error("Error Absensi:", error);

      const serverMessage =
        error.response?.data?.msg || "Terjadi kesalahan pada server";
      const validationDistance = error.response?.data?.distance
        ? ` (Jarak Wajah: ${error.response.data.distance.toFixed(3)})`
        : "";

      setAbsensiError(serverMessage);

      // 🔴 MERAH: Hanya tampilkan toast untuk error verifikasi wajah
      // Pesan "sudah absen" tidak ditampilkan karena seharusnya tidak terjadi
      if (serverMessage.toLowerCase().includes("wajah")) {
        toast.error(
          `✗ Verifikasi Wajah Gagal\n${serverMessage}${validationDistance}`,
          { duration: 4000, id: "absen-keluar" },
        );
      }
      // Tidak ada else - pesan lain (seperti "sudah absen") tidak ditampilkan

      throw error;
    } finally {
      setAbsensiLoading(false);
    }
  };

  const fetchDataAbsensi = async () => {
    setAbsensiLoading(true);
    setAbsensiError(null);

    try {
      const response = await useGetAbsensi();
      // response is the body { msg, data: {...} }; unwrap defensively
      const payload = response?.data?.data ?? response?.data ?? null;
      setAbsensiMasuk(payload);
      return payload;
    } catch (error) {
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server",
      );
      throw error;
    } finally {
      setAbsensiLoading(false);
    }
  };

  // get hari ini
  const fetchDataAbsensiHariIni = async () => {
    setAbsensiLoading(true);
    setAbsensiError(null);

    try {
      const response = await useGetAbsensiHariIni();
      const payload = response?.data?.data ?? response?.data ?? null;
      setAbsensiHariIni(payload);
      return payload;
    } catch (error) {
      console.log(error);
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server",
      );
      throw error;
    } finally {
      setAbsensiLoading(false);
    }
  };

  const fetchDataAbsensiMingguan = async () => {
    setAbsensiLoading(true);
    setAbsensiError(null);
    try {
      const response = await useGetAbsensiMingguan();
      // response is the body { msg, data: [...] }; unwrap defensively
      const payload = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data ?? [];
      setAbsensiMingguan(payload);
      return payload;
    } catch (error) {
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server",
      );
    } finally {
      setAbsensiLoading(false);
    }
  };

  return {
    absensiError,
    absensiLoading,
    absensiHariIni,
    absensiMasuk,
    handleAbsensiMasuk,
    handleAbsensiKeluar,
    fetchDataAbsensi,
    fetchDataAbsensiHariIni,
    fetchDataAbsensiMingguan,
    absensiMingguan,
  };
}
