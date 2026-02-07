import api from "../../api/api";

export const getKaryawanAnalytics = async () => {
  const response = await api.get("/karyawan/dashboard/analytics");
  return response.data;
};
