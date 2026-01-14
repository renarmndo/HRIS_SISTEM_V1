import api from "../../api/api";

// Get semua users (untuk halaman Data Users)
export const getUsers = async () => {
  const response = await api.get("/hrd/users");
  return response.data;
};

// Get karyawan saja (role=karyawan) dengan profil + gaji
export const getKaryawan = async () => {
  const response = await api.get("/hrd/karyawan");
  return response.data;
};

export const updateKaryawan = async (id, data) => {
  const response = await api.put(`/hrd/add-karyawan/${id}`, data);
  return response.data;
};

// delete
export const deleteKaryawan = async (id) => {
  const response = await api.delete(`/hrd/delete-user/${id}`);
  return response.data;
};

// update gaji pokok
export const updateGajiPokok = async (id, gaji_pokok) => {
  const response = await api.put(`/hrd/karyawan/${id}/gaji-pokok`, {
    gaji_pokok,
  });
  return response.data;
};
