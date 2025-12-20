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

      setAbsensiMasuk(response.data);

      // Tampilkan pesan sukses dari server atau default
      toast.success(response.data.msg || "Absen Masuk Berhasil", {
        duration: 2000,
        style: {
          background: "#4caf50",
          color: "#fff",
        },
      });

      // PENTING: Return data agar bisa dipakai di component
      await fetchDataAbsensi();
      return response.data;
    } catch (error) {
      console.error("Error Absensi:", error);

      // 1. Ambil pesan spesifik dari backend (Controller)
      // Controller Anda mengirim: res.status(400).json({ msg: "..." })
      const serverMessage =
        error.response?.data?.msg || "Terjadi kesalahan pada server";
      const validationDistance = error.response?.data?.distance
        ? ` (Jarak Wajah: ${error.response.data.distance})`
        : "";

      setAbsensiError(serverMessage);

      // 2. Tampilkan Toast Error yang spesifik
      toast.error(serverMessage + validationDistance, {
        duration: 3000, // Sedikit lebih lama agar terbaca
      });

      // 3. PENTING: Lempar error kembali agar processAbsensi di AbsensiPage tahu ini gagal
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

      setAbsensiMasuk(response.data);

      // Tampilkan pesan sukses dari server atau default
      toast.success(response.data.msg || "Absen Pulang Berhasil", {
        duration: 2000,
        style: {
          background: "#4caf50",
          color: "#fff",
        },
      });

      // PENTING: Return data agar bisa dipakai di component
      fetchDataAbsensi();
      return response.data;
    } catch (error) {
      console.error("Error Absensi:", error);

      // 1. Ambil pesan spesifik dari backend (Controller)
      // Controller Anda mengirim: res.status(400).json({ msg: "..." })
      const serverMessage =
        error.response?.data?.msg || "Terjadi kesalahan pada server";
      const validationDistance = error.response?.data?.distance
        ? ` (Jarak Wajah: ${error.response.data.distance})`
        : "";

      setAbsensiError(serverMessage);

      // 2. Tampilkan Toast Error yang spesifik
      toast.error(serverMessage + validationDistance, {
        duration: 3000, // Sedikit lebih lama agar terbaca
      });

      // 3. PENTING: Lempar error kembali agar processAbsensi di AbsensiPage tahu ini gagal
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
      console.log("INI DATA ABSENSI", response.data);
      setAbsensiMasuk(response.data);
      return response.data;
    } catch (error) {
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server"
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
      console.log("INI DATA ABSENSI HARI INI", response.data);
      setAbsensiHariIni(response.data);
      return response.data;
    } catch (error) {
      console.log(error);
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server"
      );
      throw error;
    } finally {
      setAbsensiLoading(false);
    }
  };

  const fetchDataAbsensiMungguan = async () => {
    setAbsensiLoading(true);
    setAbsensiError(null);
    try {
      const response = await useGetAbsensiMingguan();
      console.log("INI DATA ABSENSI MINGGUAN", response.data);
      setAbsensiMingguan(response.data);
      return response.data;
    } catch (error) {
      setAbsensiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server"
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
    fetchDataAbsensiMungguan,
    absensiMingguan,
  };
}
