import api from "../../api/api";

export const getKaryawan = async () => {
  const response = await api.get("/hrd/add-karyawan");
  return response.data;
};

export const updateKaryawan = async (id, data) => {
  const response = await api.put(`/hrd/add-karyawan/${id}`, data);
  return response.data;
};

// delte
export const deleteKaryawan = async (id) => {
  const response = await api.delete(`/hrd/delete-user/${id}`);
  return response.data;
};
