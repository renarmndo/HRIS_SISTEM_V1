import api from "../../api/api";

// Ajukan cuti baru
export const ajukanCuti = async (data) => {
  const response = await api.post("/karyawan/cuti/ajukan", data);
  return response.data;
};

// Get daftar pengajuan cuti sendiri
export const getCutiSaya = async () => {
  const response = await api.get("/karyawan/cuti/saya");
  return response.data;
};

// Get sisa kuota cuti bulan ini atau bulan tertentu
export const getSisaKuota = async (bulan = null, tahun = null) => {
  const params = new URLSearchParams();
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);

  const queryString = params.toString();
  const response = await api.get(
    `/karyawan/cuti/sisa-kuota${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};

// Cancel pengajuan cuti (hanya untuk status pending)
export const cancelPengajuan = async (id) => {
  const response = await api.delete(`/karyawan/cuti/${id}`);
  return response.data;
};
