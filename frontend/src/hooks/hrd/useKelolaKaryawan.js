import { useState } from "react";
import {
  getKaryawan,
  updateKaryawan,
  deleteKaryawan,
} from "../../services/hrd/addKaryawan";
import { toast } from "sonner";

export default function useKelolaKaryawan() {
  const [loadingKaryawan, setLoading] = useState(false);
  const [errorKaryawan, setError] = useState(null);
  const [karyawanData, setKaryawan] = useState([]);

  const getKaryawanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getKaryawan();
      const data = response.data;
      console.log("INI DATA KARYAWAN", data);
      setKaryawan(data);
    } catch (error) {
      setError(error.response.data.msg || "Terjadi kesalahan pada server");
      toast.error(error.response.data.msg || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  const editKaryawanData = async (id, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateKaryawan(id, payload);

      const updated = response.data;
      // sesuaikan dengan struktur response API-mu

      toast.success("Data berhasil diupdate", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#4ade80",
          color: "white",
        },
      });

      setKaryawan(updated);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.msg || "Terjadi kesalahan pada server");

      toast.error(error.response?.data?.msg || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  const deleteKarywanData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteKaryawan(id);

      toast.success("Berhasil Menghapus Data", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#4ade80",
          color: "white",
        },
      });
      await getKaryawanData();
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.msg || "Terjadi kesalahan pada server");
      toast.error(error.response?.data?.msg || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return {
    loadingKaryawan,
    errorKaryawan,
    karyawanData,
    getKaryawanData,
    editKaryawanData,
    deleteKarywanData,
  };
}
