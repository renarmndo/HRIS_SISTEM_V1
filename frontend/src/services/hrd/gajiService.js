import api from "../../api/api";

// ============ KOMPONEN GAJI ============

export const getKomponenGaji = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/hrd/komponen-gaji${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

export const createKomponenGaji = async (data) => {
  const response = await api.post("/hrd/komponen-gaji", data);
  return response.data;
};

export const updateKomponenGaji = async (id, data) => {
  const response = await api.put(`/hrd/komponen-gaji/${id}`, data);
  return response.data;
};

export const deleteKomponenGaji = async (id) => {
  const response = await api.delete(`/hrd/komponen-gaji/${id}`);
  return response.data;
};

// ============ SLIP GAJI ============

export const generateSlipGaji = async (bulan, tahun) => {
  const response = await api.post("/hrd/slip-gaji/generate", { bulan, tahun });
  return response.data;
};

export const getSlipGajiBulanan = async (bulan, tahun, status = null) => {
  const params = new URLSearchParams();
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);
  if (status) params.append("status", status);

  const queryString = params.toString();
  const response = await api.get(
    `/hrd/slip-gaji${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

export const getSlipGajiDetail = async (id) => {
  const response = await api.get(`/hrd/slip-gaji/${id}`);
  return response.data;
};

export const updateSlipGaji = async (id, data) => {
  const response = await api.put(`/hrd/slip-gaji/${id}`, data);
  return response.data;
};

export const finalizeSlipGaji = async (id) => {
  const response = await api.put(`/hrd/slip-gaji/${id}/finalize`);
  return response.data;
};
