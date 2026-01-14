import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  getKuotaCuti,
  createKuotaCuti,
  updateKuotaCuti,
  deleteKuotaCuti,
  getPengajuanCuti,
  updateStatusPengajuan,
} from "../../services/hrd/cutiService";

export default function useCuti() {
  const [loading, setLoading] = useState(false);
  const [kuotaCutiList, setKuotaCutiList] = useState([]);
  const [pengajuanCutiList, setPengajuanCutiList] = useState([]);

  // Get all kuota cuti
  const fetchKuotaCuti = useCallback(async (tahun = null) => {
    setLoading(true);
    try {
      const response = await getKuotaCuti(tahun);
      setKuotaCutiList(response.data || []);
      return response;
    } catch (error) {
      toast.error(
        error.response?.data?.msg || "Gagal mengambil data kuota cuti"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create kuota cuti
  const handleCreateKuotaCuti = useCallback(
    async (data) => {
      setLoading(true);
      try {
        const response = await createKuotaCuti(data);
        toast.success(response.msg || "Berhasil menambah kuota cuti");
        await fetchKuotaCuti();
        return response;
      } catch (error) {
        toast.error(error.response?.data?.msg || "Gagal menambah kuota cuti");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchKuotaCuti]
  );

  // Update kuota cuti
  const handleUpdateKuotaCuti = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        const response = await updateKuotaCuti(id, data);
        toast.success(response.msg || "Berhasil memperbarui kuota cuti");
        await fetchKuotaCuti();
        return response;
      } catch (error) {
        toast.error(
          error.response?.data?.msg || "Gagal memperbarui kuota cuti"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchKuotaCuti]
  );

  // Delete kuota cuti
  const handleDeleteKuotaCuti = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const response = await deleteKuotaCuti(id);
        toast.success(response.msg || "Berhasil menghapus kuota cuti");
        await fetchKuotaCuti();
        return response;
      } catch (error) {
        toast.error(error.response?.data?.msg || "Gagal menghapus kuota cuti");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchKuotaCuti]
  );

  // Get pengajuan cuti
  const fetchPengajuanCuti = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await getPengajuanCuti(params);
      setPengajuanCutiList(response.data || []);
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

  // Approve/Reject pengajuan cuti
  const handleUpdateStatusPengajuan = useCallback(
    async (id, data) => {
      setLoading(true);
      try {
        const response = await updateStatusPengajuan(id, data);
        toast.success(response.msg || "Status pengajuan berhasil diperbarui");
        await fetchPengajuanCuti();
        return response;
      } catch (error) {
        toast.error(
          error.response?.data?.msg || "Gagal memperbarui status pengajuan"
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchPengajuanCuti]
  );

  return {
    loading,
    kuotaCutiList,
    pengajuanCutiList,
    fetchKuotaCuti,
    handleCreateKuotaCuti,
    handleUpdateKuotaCuti,
    handleDeleteKuotaCuti,
    fetchPengajuanCuti,
    handleUpdateStatusPengajuan,
  };
}
