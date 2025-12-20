import { useState } from "react";
import {
  getLokasi,
  createLokasi,
  updateLokasi,
} from "../../services/hrd/addLokasiKantor";
import { toast } from "sonner";

export default function useLokasiKantor() {
  const [loadingKantor, setLoadingKantor] = useState(false);
  const [lokasiKantor, setLokasiKantor] = useState([]);
  const [lokasiError, setLokasiError] = useState(null);

  // get
  const useGetLokasi = async () => {
    setLoadingKantor(true);
    setLokasiError(null);
    try {
      const response = await getLokasi();
      const lokasi = response.data;
      console.log("Ini Lokasi Data Kantor", lokasi);
      setLokasiKantor(lokasi);
    } catch (error) {
      console.log(error);
      setLokasiError(
        error.response?.data?.msg || "Terjadi Kesalahan pada server"
      );
    } finally {
      setLoadingKantor(false);
    }
  };

  //   update
  const useUpdateLokasi = async (id, payload) => {
    setLoadingKantor(true);
    setLokasiError(null);
    try {
      const response = await updateLokasi(id, payload);
      toast.success("Berhasil Memperbarui data", {
        duration: 2000,
        style: {
          borderRadius: "10px",
          background: "#4ade80",
          color: "white",
        },
      });
      setLokasiKantor(response.data);
      useGetLokasi();
    } catch (error) {
      console.log(error);
      setLokasiError(
        error.response?.data?.msg || "Terjadi kesalahan pada server"
      );
      toast.error(error.response?.data?.msg || "Gagal Memperbarui Data");
    } finally {
      setLoadingKantor(false);
    }
  };

  // create
  const useCreateLokasi = async (data) => {
    loadingKantor(true);
    lokasiError(null);

    try {
      const response = await createLokasi(data);
      toast.success("Berhasil Menambahkan Data", {
        duration: 2000,
        style: {
          background: "#10b981",
          color: "black",
          borderBlockEnd: "1px solid #059669",
        },
      });
      setLokasiKantor(response.data);
      useGetLokasi();
    } catch (error) {
      console.log(error);
      setLokasiError(
        error.response?.data?.msg || "Terjadi Kesalahan Pada Server"
      );
      toast.error("Gagal Memperbarui Data", {
        duration: 2000,
      });
    } finally {
      setLoadingKantor(false);
    }
  };

  return {
    loadingKantor,
    lokasiError,
    lokasiKantor,

    //
    useGetLokasi,
    useUpdateLokasi,
    useCreateLokasi,
  };
}
