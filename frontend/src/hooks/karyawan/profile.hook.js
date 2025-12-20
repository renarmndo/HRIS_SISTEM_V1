import {
  createProfile,
  getProfile,
  updateProfile,
} from "../../services/karyawan/profile.service";

import { useState } from "react";
import { toast } from "sonner";

export default function useProfile() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState([]);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      console.log(error);
      setError(
        error.response.msg || "Terjadi kesalahan pada saat mendapatkan data"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEditProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateProfile(data);
      setProfile(response.data);
      toast.success("Berhasil Memperbarui Data", {
        duration: 2000,
        style: {
          background: "#4caf50", // contoh hijau untuk sukses
          color: "#fff",
        },
      });
    } catch (error) {
      console.log(error);
      setError(error.response.data.msg || "Terjadi kesalahan pada server");
      toast.error("Error", {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCreateProfile = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createProfile(data);
      setProfile(response.data);
      toast.success("Berhasil Menambahkan Data", {
        duration: 2000,
        style: {
          background: "#4caf50", // contoh hijau untuk sukses
          color: "#fff",
        },
      });
    } catch (error) {
      console.log(error);
      setError(error.response.data.msg || "Terjadi Kesalahan pada server");
      toast.error(error.response.msg, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchProfile,
    fetchEditProfile,
    fetchCreateProfile,
    profile,
  };
}
