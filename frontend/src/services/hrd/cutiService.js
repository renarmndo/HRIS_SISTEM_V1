import api from "../../api/api";

// Kuota Cuti
export const getKuotaCuti = async (tahun = null) => {
  const params = tahun ? `?tahun=${tahun}` : "";
  const response = await api.get(`/hrd/kuota-cuti${params}`);
  return response.data;
};

export const getKuotaCutiByBulanTahun = async (bulan, tahun) => {
  const response = await api.get(`/hrd/kuota-cuti/${bulan}/${tahun}`);
  return response.data;
};

export const createKuotaCuti = async (data) => {
  const response = await api.post("/hrd/kuota-cuti", data);
  return response.data;
};

export const updateKuotaCuti = async (id, data) => {
  const response = await api.put(`/hrd/kuota-cuti/${id}`, data);
  return response.data;
};

export const deleteKuotaCuti = async (id) => {
  const response = await api.delete(`/hrd/kuota-cuti/${id}`);
  return response.data;
};

// Pengajuan Cuti (untuk HRD)
export const getPengajuanCuti = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/hrd/pengajuan-cuti${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

export const updateStatusPengajuan = async (id, data) => {
  const response = await api.put(`/hrd/pengajuan-cuti/${id}/status`, data);
  return response.data;
};
