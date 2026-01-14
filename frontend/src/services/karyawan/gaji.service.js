import api from "../../api/api";

// Get slip gaji sendiri
export const getSlipGajiSaya = async (bulan = null, tahun = null) => {
  const params = new URLSearchParams();
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);

  const queryString = params.toString();
  const response = await api.get(
    `/karyawan/slip-gaji${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

// Get detail slip gaji
export const getSlipGajiDetail = async (id) => {
  const response = await api.get(`/karyawan/slip-gaji/${id}`);
  return response.data;
};
