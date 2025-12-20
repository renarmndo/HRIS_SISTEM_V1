import { toast } from "sonner";
import {
  getFace,
  registFace,
  updateFace,
} from "../../services/karyawan/face.service";
import { useState, useCallback } from "react";

export default function useFaceProfile() {
  const [loadingFace, setLoading] = useState(false);
  const [errorFace, setError] = useState(null);
  const [faceProfile, setFaceProfile] = useState(null);

  const fetchProfileFace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getFace(); // ini langsung response, bukan axios object
      console.log("INI response FETCH PROFILE", response.data);
      setFaceProfile(response.data);
      return response;
    } catch (error) {
      console.error("Error fetching face profile:", error);
      setError(error.response?.data?.msg || "Terjadi kesalahan pada server");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFaceProfile = useCallback(
    async (faceDescriptor) => {
      // 1. Validasi Input
      if (!faceDescriptor) {
        toast.error("Tidak ada data wajah untuk disimpan", { duration: 2000 });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 2. Konversi Float32Array ke Array Biasa (Wajib agar bisa jadi JSON)
        // Kita lakukan konversi di sini agar Component terima beres
        const descriptorArray = Array.from(faceDescriptor);

        // 3. PERBAIKAN UTAMA: Sesuaikan key dengan Backend Controller
        // Backend: const { face_embedding } = req.body;
        const payload = {
          face_embedding: descriptorArray, // JANGAN pakai 'descriptor', pakai 'face_embedding'
        };

        // 4. Kirim ke API
        const response = await registFace(payload);

        toast.success("Berhasil melakukan registrasi wajah", {
          duration: 2000,
        });

        await fetchProfileFace();
        return response;
      } catch (error) {
        console.error("Error saving face profile:", error);
        const errorMsg =
          error.response?.data?.msg || "Gagal melakukan registrasi";
        setError(errorMsg);
        toast.error(errorMsg, { duration: 2000 });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchProfileFace]
  );

  // Update facesave
  const updateFaceProfile = useCallback(
    async (faceDescriptor) => {
      if (!faceDescriptor || !faceProfile?.id) {
        toast.error("Tidak ada data untuk diperbarui", { duration: 2000 });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const descriptorArray = Array.from(faceDescriptor);

        const updateData = {
          descriptor: descriptorArray,
          updatedAt: new Date().toISOString(),
        };

        const response = await updateFace(faceProfile.id, updateData);

        toast.success("Wajah berhasil diperbarui", {
          duration: 2000,
        });

        await fetchProfileFace();
        return response;
      } catch (error) {
        console.error("Error updating face profile:", error);
        const errorMsg = error.response?.data?.msg || "Gagal memperbarui wajah";
        setError(errorMsg);
        toast.error(errorMsg, { duration: 2000 });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [faceProfile, fetchProfileFace]
  );

  // Hapus face profile
  const deleteFaceProfile = useCallback(async () => {
    if (!faceProfile?.id) {
      toast.error("Tidak ada data wajah untuk dihapus", { duration: 2000 });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Implement delete API call here
      // await deleteFace(faceProfile.id);

      setFaceProfile(null);
      toast.success("Data wajah berhasil dihapus", { duration: 2000 });
    } catch (error) {
      console.error("Error deleting face profile:", error);
      setError("Gagal menghapus data wajah");
      toast.error("Gagal menghapus data wajah", { duration: 2000 });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [faceProfile]);

  const hasFaceProfile = useCallback(() => {
    // console.log("INI DATA FACE", faceProfile);
    return !!faceProfile?.face_embedding;
  }, [faceProfile]);

  return {
    loadingFace,
    errorFace,
    faceProfile,
    fetchProfileFace,
    saveFaceProfile,
    updateFaceProfile,
    deleteFaceProfile,
    hasFaceProfile,
  };
}
