import api from "../../api/api";

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get("/hrd/dashboard/stats");
  return response.data;
};

// Get pengajuan cuti terbaru
export const getPengajuanCutiTerbaru = async () => {
  const response = await api.get("/hrd/dashboard/pengajuan-cuti");
  return response.data;
};

// Quick approve/reject pengajuan cuti
export const quickUpdatePengajuanStatus = async (id, status, catatan) => {
  const response = await api.put(`/hrd/dashboard/pengajuan-cuti/${id}`, {
    status,
    catatan_approval: catatan,
  });
  return response.data;
};
