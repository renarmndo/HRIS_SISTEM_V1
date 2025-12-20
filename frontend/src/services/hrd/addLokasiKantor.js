import api from "../../api/api";

export const getLokasi = async () => {
  const response = await api.get("/hrd/lokasi");
  return response.data;
};

export const createLokasi = async (data) => {
  const response = await api.post("/hrd/lokasi", data);
  return response.data;
};

export const updateLokasi = async (id, data) => {
  const response = await api.put(`/hrd/lokasi/${id}`, data);
  return response.data;
};
