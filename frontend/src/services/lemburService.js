import api from "../api/api";

// ============ KARYAWAN LEMBUR ============

export const createLembur = async (data) => {
  const response = await api.post("/karyawan/lembur", data);
  return response.data;
};

export const getMyLembur = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/karyawan/lembur${queryString ? `?${queryString}` : ""}`,
  );
  return response.data;
};

export const deleteLembur = async (id) => {
  const response = await api.delete(`/karyawan/lembur/${id}`);
  return response.data;
};

// ============ HRD LEMBUR ============

export const getAllLembur = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/hrd/lembur${queryString ? `?${queryString}` : ""}`,
  );
  return response.data;
};

export const getLemburStats = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/hrd/lembur/stats${queryString ? `?${queryString}` : ""}`,
  );
  return response.data;
};

export const approveLembur = async (id) => {
  const response = await api.put(`/hrd/lembur/${id}/approve`);
  return response.data;
};

export const rejectLembur = async (id, rejection_reason) => {
  const response = await api.put(`/hrd/lembur/${id}/reject`, {
    rejection_reason,
  });
  return response.data;
};
