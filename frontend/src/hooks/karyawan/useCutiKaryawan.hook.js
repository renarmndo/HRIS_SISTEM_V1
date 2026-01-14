import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ajukanCuti,
  getCutiSaya,
  getSisaKuota,
  cancelPengajuan,
} from "../../services/karyawan/cutiKaryawan.service";

export default function useCutiKaryawan() {
  const [loading, setLoading] = useState(false);
  const [cutiList, setCutiList] = useState([]);
  const [sisaKuota, setSisaKuota] = useState(null);

  // Fetch daftar pengajuan cuti sendiri
  const fetchCutiSaya = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCutiSaya();
      setCutiList(response.data || []);
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Gagal mengambil data pengajuan cuti"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sisa kuota cuti
  const fetchSisaKuota = useCallback(async (bulan = null, tahun = null) => {
    try {
      const response = await getSisaKuota(bulan, tahun);
      setSisaKuota(response.data || null);
      return response;
    } catch (error) {
      // Jika kuota belum diatur, set null tanpa toast error
      setSisaKuota(null);
      if (error.response?.status !== 404) {
        toast.error(
          error.response?.data?.msg || "Gagal mengambil data kuota cuti"
        );
      }
      throw error;
    }
  }, []);

  // Ajukan cuti baru
  const handleAjukanCuti = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await ajukanCuti(data);
        toast.success(response.msg || "Berhasil mengajukan cuti");
        await fetchCutiSaya();
        await fetchSisaKuota();
        return response;
      } catch (error) {
        toast.error(error.response?.data?.msg || "Gagal mengajukan cuti");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCutiSaya, fetchSisaKuota]
  );

  // Cancel pengajuan cuti
  const handleCancelPengajuan = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await cancelPengajuan(id);
        toast.success(response.msg || "Berhasil membatalkan pengajuan cuti");
        await fetchCutiSaya();
        await fetchSisaKuota();
        return response;
      } catch (error) {
        toast.error(
          error.response?.data?.msg || "Gagal membatalkan pengajuan cuti"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchCutiSaya, fetchSisaKuota]
  );

  return {
    loading,
    cutiList,
    sisaKuota,
    fetchCutiSaya,
    fetchSisaKuota,
    handleAjukanCuti,
    handleCancelPengajuan,
  };
}
